import { supabaseAdmin } from "../config/supabaseClient.js";

const PROFILES_TABLE = "profiles";
const RESIDENTS_TABLE = "residents";

const isAnyMissingColumnError = (error) => {
  const message = error?.message || "";
  return (
    message.includes("does not exist") ||
    message.includes("Could not find") ||
    message.includes("schema cache")
  );
};

const isRoleEnumError = (error) => {
  const message = error?.message || "";
  return message.includes("invalid input value for enum") && message.includes("role");
};

const capitalize = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

// Create user in Supabase Auth
const createUserInAuth = async (email, password) => {
  const adminClient = supabaseAdmin;
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    if (authError.message.includes("already been registered")) {
      throw new Error("USER_ALREADY_EXISTS");
    }
    throw authError;
  }

  return authData;
};

const deleteUserInAuth = async (userId) => {
  const adminClient = supabaseAdmin;
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error("AUTH_DELETE_FAILED: " + error.message);
  }
};

// Create user profile in profiles table
const createUserProfile = async (userId, profileData) => {
  const adminClient = supabaseAdmin;
  const fullProfile = {
    user_id: userId,
    first_name: profileData.first_name,
    last_name: profileData.last_name,
    email: profileData.email,
    nic_passport: profileData.nic_passport,
    phone: profileData.phone,
    role: profileData.role,
  };

  let { error } = await adminClient
    .from(PROFILES_TABLE)
    .insert([fullProfile]);

  if (!error) {
    return;
  }

  // Some deployments may use enum role values with different casing.
  if (isRoleEnumError(error)) {
    const roleCandidates = [capitalize(profileData.role), profileData.role?.toUpperCase()]
      .filter(Boolean)
      .filter((candidate) => candidate !== profileData.role);

    for (const candidateRole of roleCandidates) {
      const { error: roleRetryError } = await adminClient
        .from(PROFILES_TABLE)
        .insert([{ ...fullProfile, role: candidateRole }]);

      if (!roleRetryError) {
        return;
      }

      error = roleRetryError;
    }
  }

  // Fallback: only include core columns to avoid cascading missing-column errors
  const fallbackNeeded = isAnyMissingColumnError(error);

  if (fallbackNeeded) {
    const fallbackProfile = {
      user_id: userId,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone: profileData.phone,
      role: profileData.role,
    };

    const { error: fallbackError } = await adminClient
      .from(PROFILES_TABLE)
      .insert([fallbackProfile]);

    if (!fallbackError) {
      return;
    }

    error = fallbackError;
  }

  if (error) {
    throw new Error("PROFILE_CREATE_FAILED: " + error.message);
  }
};

// Create a resident record (when role is resident)
const createResidentRecord = async (userId, apartmentNo) => {
  const adminClient = supabaseAdmin;
  const { error } = await adminClient
    .from(RESIDENTS_TABLE)
    .insert([
      {
        user_id: userId,
        apartment_no: apartmentNo,
        date_of_entry: new Date().toISOString().split("T")[0],
      },
    ]);

  if (error) {
    throw new Error("RESIDENT_CREATE_FAILED: " + error.message);
  }

  return { user_id: userId, apartment_no: apartmentNo };
};

const USER_SORT_FIELDS = {
  name: "first_name",
  email: "email",
  role: "role",
  status: "is_active",
  created_at: "created_at",
  updated_at: "updated_at",
};

// Get all users with pagination, search, role filter, and sorting
const getAllUsers = async ({ search, role, page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc" }) => {
  const offset = (page - 1) * limit;
  const sortColumn = USER_SORT_FIELDS[sortBy] || USER_SORT_FIELDS.created_at;
  const ascending = sortOrder === "asc";

  let query = supabaseAdmin
    .from(PROFILES_TABLE)
    .select("*", { count: "exact" })
    .order(sortColumn, { ascending, nullsFirst: !ascending });

  if (sortBy === "name") {
    query = query.order("last_name", { ascending, nullsFirst: !ascending });
  }

  if (role) {
    const roleCandidates = [role, capitalize(role), role.toUpperCase()]
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);
    query = query.in("role", roleCandidates);
  }

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,nic_passport.ilike.%${search}%`
    );
  }

  query = query.range(offset, offset + limit - 1);

  let { data, error, count } = await query;

  // Fallback: if search fails due to missing columns, retry with name-only search
  if (error && search) {
    let fallbackQuery = supabaseAdmin
      .from(PROFILES_TABLE)
      .select("*", { count: "exact" })
      .order(sortColumn, { ascending, nullsFirst: !ascending });

    if (sortBy === "name") {
      fallbackQuery = fallbackQuery.order("last_name", { ascending, nullsFirst: !ascending });
    }

    if (role) {
      const roleCandidates = [role, capitalize(role), role.toUpperCase()]
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index);
      fallbackQuery = fallbackQuery.in("role", roleCandidates);
    }

    fallbackQuery = fallbackQuery.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%`
    );

    fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);
    const fallbackResult = await fallbackQuery;
    data = fallbackResult.data;
    error = fallbackResult.error;
    count = fallbackResult.count;
  }

  if (error) {
    throw new Error("FETCH_USERS_FAILED: " + error.message);
  }

  let users = (data || []).map((u) => ({
    ...u,
    is_active: u.is_active !== undefined ? u.is_active : true,
  }));

  // If any user has is_active undefined (column missing), enrich from auth metadata
  const hasUndefined = (data || []).some((u) => u.is_active === undefined);
  if (hasUndefined) {
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      if (authData?.users) {
        const authMap = new Map(authData.users.map((au) => [au.id, au]));
        users = users.map((u) => {
          if (u.is_active !== undefined && u.is_active !== true) return u;
          const authUser = authMap.get(u.user_id);
          const metaActive = authUser?.user_metadata?.is_active;
          return {
            ...u,
            is_active: metaActive !== undefined ? metaActive : true,
          };
        });
      }
    } catch (e) {
      // If auth list fails, keep the defaults
      console.error("Failed to enrich users from auth metadata:", e.message);
    }
  }

  return {
    users,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};

// Get a single user by ID
const getUserById = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from(PROFILES_TABLE)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error("USER_NOT_FOUND");
  }

  return data;
};

// Update user profile (admin-allowed fields only)
const updateUserProfile = async (userId, updateData) => {
  // If role is being updated, try multiple casing variants (DB may use enum)
  const roleCandidates = updateData.role
    ? [updateData.role, capitalize(updateData.role), updateData.role.toUpperCase()]
        .filter((v, i, a) => a.indexOf(v) === i)
    : [null];

  for (const roleCandidate of roleCandidates) {
    const payload = { ...updateData, updated_at: new Date().toISOString() };
    if (roleCandidate) payload.role = roleCandidate;

    const { data, error } = await supabaseAdmin
      .from(PROFILES_TABLE)
      .update(payload)
      .eq("user_id", userId)
      .select();

    if (!error && data && data.length > 0) return data[0];

    // Fallback: retry without updated_at if column is missing
    if (error && isAnyMissingColumnError(error)) {
      const fallbackPayload = { ...updateData };
      if (roleCandidate) fallbackPayload.role = roleCandidate;

      const { data: d2, error: e2 } = await supabaseAdmin
        .from(PROFILES_TABLE)
        .update(fallbackPayload)
        .eq("user_id", userId)
        .select();

      if (!e2 && d2 && d2.length > 0) return d2[0];
    }

    // If it's a role enum error, try next casing variant
    if (error && isRoleEnumError(error)) continue;

    // For other errors, throw immediately
    if (error) throw new Error("UPDATE_USER_FAILED: " + error.message);
  }

  throw new Error("UPDATE_USER_FAILED: User not found or role value rejected by database");
};

// Set user active status
const setUserActiveStatus = async (userId, isActive) => {
  // Verify user exists in profiles
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from(PROFILES_TABLE)
    .select()
    .eq("user_id", userId)
    .single();

  if (fetchError || !profile) {
    throw new Error("USER_NOT_FOUND");
  }

  // Always persist status in Supabase Auth user_metadata (works without migration)
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { is_active: isActive },
  });

  if (authError) {
    throw new Error("STATUS_UPDATE_FAILED: " + authError.message);
  }

  // Try to also update the profiles table column (best-effort)
  const { data, error } = await supabaseAdmin
    .from(PROFILES_TABLE)
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select();

  if (!error && data && data.length > 0) return data[0];

  // Column may not exist — return profile with overridden is_active
  return { ...profile, is_active: isActive };
};

// Hard delete user profile and dependent records
const deleteUserProfile = async (userId) => {
  // Delete dependent resident record first (FK constraint)
  const { error: residentError } = await supabaseAdmin
    .from(RESIDENTS_TABLE)
    .delete()
    .eq("user_id", userId);

  // Ignore "no rows matched" — only throw on real failures
  if (residentError && !residentError.message.includes("0 rows")) {
    console.error("Resident delete warning:", residentError.message);
  }

  const { error } = await supabaseAdmin
    .from(PROFILES_TABLE)
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error("PROFILE_DELETE_FAILED: " + error.message);
  }
};

export {
  createUserInAuth,
  deleteUserInAuth,
  createUserProfile,
  createResidentRecord,
  getAllUsers,
  getUserById,
  updateUserProfile,
  setUserActiveStatus,
  deleteUserProfile,
};

import { supabaseAdmin } from "../config/supabaseClient.js";

const PROFILES_TABLE = "profiles";
const RESIDENTS_TABLE = "residents";
const APARTMENT_RESIDENTS_TABLE = "apartment_residents";

const isIgnorableApartmentResidentsError = (message = "") => {
  const normalizedMessage = message.toLowerCase();
  return (
    (normalizedMessage.includes("relation") && normalizedMessage.includes("does not exist")) ||
    normalizedMessage.includes("could not find the table") ||
    normalizedMessage.includes("apartment_residents")
  );
};

// Get combined resident profile from profiles + residents + apartment_residents
const getResidentProfile = async (userId) => {
  // Fetch from profiles
  const { data: profile, error: profileError } = await supabaseAdmin
    .from(PROFILES_TABLE)
    .select("user_id, first_name, last_name, email, nic_passport, phone")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  // Fetch from residents
  const { data: resident, error: residentError } = await supabaseAdmin
    .from(RESIDENTS_TABLE)
    .select("apartment_no, date_of_birth, gender, marital_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (residentError) {
    console.error("Resident fetch error:", residentError);
  }

  // Fetch apartment resident count
  let residentCount = 0;
  if (resident?.apartment_no) {
    const { data: apartment, error: aptError } = await supabaseAdmin
      .from(APARTMENT_RESIDENTS_TABLE)
      .select("resident_count")
      .eq("apartment_no", resident.apartment_no)
      .maybeSingle();

    if (aptError) {
      console.error("Apartment fetch error:", aptError);
    }

    residentCount = apartment?.resident_count || 0;
  }

  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    nic_passport: profile.nic_passport,
    phone: profile.phone,
    date_of_birth: resident?.date_of_birth || null,
    gender: resident?.gender || null,
    marital_status: resident?.marital_status || null,
    apartment_no: resident?.apartment_no || null,
    resident_count: residentCount,
  };
};

// Update resident profile across profiles, residents, and apartment_residents
const updateResidentProfile = async (userId, data) => {
  // 1. Update profiles table
  const profileFields = {};
  if (data.first_name !== undefined) profileFields.first_name = data.first_name;
  if (data.last_name !== undefined) profileFields.last_name = data.last_name;
  if (data.phone !== undefined) profileFields.phone = data.phone;

  if (Object.keys(profileFields).length > 0) {
    profileFields.updated_at = new Date().toISOString();
    const { error: profileError } = await supabaseAdmin
      .from(PROFILES_TABLE)
      .update(profileFields)
      .eq("user_id", userId);

    if (profileError) {
      throw new Error("PROFILE_UPDATE_FAILED: " + profileError.message);
    }
  }

  // 2. Update residents table
  const residentFields = {};
  if (data.date_of_birth !== undefined) residentFields.date_of_birth = data.date_of_birth;
  if (data.gender !== undefined) residentFields.gender = data.gender;
  if (data.marital_status !== undefined) residentFields.marital_status = data.marital_status;
  if (data.apartment_no !== undefined) residentFields.apartment_no = data.apartment_no;

  if (Object.keys(residentFields).length > 0) {
    residentFields.updated_at = new Date().toISOString();
    const { error: residentError } = await supabaseAdmin
      .from(RESIDENTS_TABLE)
      .update(residentFields)
      .eq("user_id", userId);

    if (residentError) {
      throw new Error("RESIDENT_UPDATE_FAILED: " + residentError.message);
    }
  }

  // 3. Upsert apartment_residents if resident_count or apartment_no provided
  if (data.apartment_no !== undefined && data.resident_count !== undefined) {
    const { error: aptError } = await supabaseAdmin
      .from(APARTMENT_RESIDENTS_TABLE)
      .upsert(
        {
          apartment_no: data.apartment_no,
          resident_count: data.resident_count,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "apartment_no" }
      );

    if (aptError) {
      if (isIgnorableApartmentResidentsError(aptError.message)) {
        console.warn("Apartment residents update skipped:", aptError.message);
      } else {
        throw new Error("APARTMENT_UPDATE_FAILED: " + aptError.message);
      }
    }
  } else if (data.resident_count !== undefined) {
    // Update resident_count for current apartment
    const { data: resident } = await supabaseAdmin
      .from(RESIDENTS_TABLE)
      .select("apartment_no")
      .eq("user_id", userId)
      .maybeSingle();

    if (resident?.apartment_no) {
      const { error: aptError } = await supabaseAdmin
        .from(APARTMENT_RESIDENTS_TABLE)
        .upsert(
          {
            apartment_no: resident.apartment_no,
            resident_count: data.resident_count,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "apartment_no" }
        );

      if (aptError) {
        if (isIgnorableApartmentResidentsError(aptError.message)) {
          console.warn("Apartment residents update skipped:", aptError.message);
        } else {
          throw new Error("APARTMENT_UPDATE_FAILED: " + aptError.message);
        }
      }
    }
  }

  // Return updated profile
  return getResidentProfile(userId);
};

export { getResidentProfile, updateResidentProfile };

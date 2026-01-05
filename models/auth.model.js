import { supabaseAdmin } from "../config/supabaseClient.js";

// login user
const loginUser = async (email, password) => {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data?.session) {
    throw new Error("INVALID_CREDENTIALS");
  }
  return data;
};

const getUserRole = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("ROLE_NOT_FOUND");
  }

  return data.role;
};

// get user profile
const getUserProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(`
      user_id,
      first_name,
      last_name,
      phone,
      role,
      created_at,
      residents!residents_user_id_fkey (
        apartment_no,
        building,
        date_of_entry
      )
    `)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  return data;
};


// Logout user by invalidating their session
const logoutUser = async (token) => {
  const { error } = await supabaseAdmin.auth.admin.signOut(token);

  if (error) {
    throw new Error("LOGOUT_FAILED");
  }

  return true;
};

// Send password reset email
const sendPasswordResetEmail = async (email) => {
  const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`
  });

  if (error) {
    throw new Error("EMAIL_SEND_FAILED");
  }

  return data;
};

// Register user

const signUpUser = async (email, password, first_name, last_name, apartment_no, phone) =>{
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
    }
  )
  if (authError) {
    if (authError.message.includes("Already registered")) {
      throw new Error("USER_ALREADY_EXISTS");
    }
    throw  authError;
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert([
      {
        user_id: userId,
        first_name,
        last_name,
        phone,
        role: "resident",
      },
    ]);

  if (profileError) {
    throw profileError;
  }

  const { data: residentData, error: residentError } = await supabaseAdmin
    .from("residents")
    .insert([
      {
        user_id: userId,
        apartment_no,
        date_of_entry: new Date().toISOString().split("T")[0],
      },
    ]);

    if (residentError) {
      throw residentError;
    }
  return authData;
  
} 

export { loginUser, getUserRole, getUserProfile, logoutUser, sendPasswordResetEmail,signUpUser };
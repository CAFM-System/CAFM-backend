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


//  get user profile
const getUserProfile = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  return data;
};

export { loginUser, getUserRole, getUserProfile };
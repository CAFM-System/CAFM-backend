import { supabaseAdmin } from "../config/supabaseClient.js";


const loginUser = async (email, password) => {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data?.session) {
    throw new Error("INVALID_CREDENTIALS");
  }
  return data; // { user, session }
};

/**
 * Get user role from profiles table
 */
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

export {loginUser,getUserRole};

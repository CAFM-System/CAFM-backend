import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;


console.log("--- DEBUG: KEY CHECK ---");
console.log("URL:", supabaseUrl);
console.log("Service Role Key exists:", !!supabaseServiceRoleKey);
console.log("Anon Key exists:", !!supabaseAnonKey);
console.log("Are they different?:", supabaseServiceRoleKey !== supabaseAnonKey);


const baseAuth = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false
}



const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    
    { auth: baseAuth,
      global: {
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`
      }
    }}
);


const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    
    { auth: baseAuth }
);

export { supabaseAdmin, supabase };
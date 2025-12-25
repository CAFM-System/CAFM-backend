import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const options = {
  auth: {
    persistSession: false, 
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
};

const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    options
);

const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    options
);

export { supabaseAdmin, supabase };
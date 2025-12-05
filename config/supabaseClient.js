import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceRoleKey
);

const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);

export { supabaseAdmin, supabase };
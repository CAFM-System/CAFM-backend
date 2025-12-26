import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

const getTechnicians = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select("user_id,first_name,last_name")
        .eq('role', 'technician');
        

    if (error) {
        throw new Error('Error fetching technicians: ' + error.message);
    }
    return data;
}


export { getTechnicians };
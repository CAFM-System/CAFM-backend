import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

const getTechnicians = async (jobType) => {
    const { data, error } = await supabase
        .from('profiles')
        .select(
            `user_id,
            first_name,
            last_name,
            technicians!inner(
                job
            )
            `)
        .eq('role', 'technician')
        .eq('technicians.job', jobType);
        

    if (error) {
        throw new Error('Error fetching technicians: ' + error.message);
    }
    

    return data;
}


export { getTechnicians };
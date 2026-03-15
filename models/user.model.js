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
const getResidents = async () => {
    const { data, error } = await supabaseAdmin
    .from("residents")
    .select(`
        user_id,
        apartment_no,
        building,
        profiles (
        first_name,
        last_name,
        phone
        )
    `);
    if (error) {
        throw new Error('Error fetching residents: ' + error.message);
    }
    return data;
}
export { getTechnicians , getResidents};
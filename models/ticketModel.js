import { supabase } from "../config/supabaseClient.js";

const TABLE_NAME = "tickets";

const getAllTickets = async ()=> {
    const { data, error} = await supabase
        .from (TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false});
    if (error) {
        throw new Error(error.message);
    }
    return data;
}



export  { getAllTickets };
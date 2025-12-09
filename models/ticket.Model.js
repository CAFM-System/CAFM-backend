import { supabase } from "../config/supabaseClient.js";

const TABLE_NAME = "tickets";

const getAllTickets = async ()=> {
    const { data, error} = await supabase
        .from (TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: true});
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

const addTicketData = async (ticketData) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([ticketData])
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}



export  { getAllTickets, addTicketData };
import { supabase } from "../config/supabaseClient.js";

const TABLE_NAME = "progress_histories";

const getProgressHistoryByUserId = async (ticketId) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return data;
}

const addProgressHistory = async (progressData) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([progressData])
        .single();

    if (error) throw new Error(error.message);

    return data;
}

export { getProgressHistoryByUserId, addProgressHistory };
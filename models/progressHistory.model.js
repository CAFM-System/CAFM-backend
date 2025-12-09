
import { supabase } from "../config/supabaseClient.js";

const TABLE_NAME = "progress_histories";

const getProgressHistoryByTicketId = async (ticketId) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    if (!data || data.length === 0)
        return { message: "No progress history found for this ticket ID" };

    return data;
}

const addProgressHistoryEntry = async (progressData) => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([progressData])
        .single();

    if (error) throw new Error(error.message);

    return data;
}

export { getProgressHistoryByTicketId, addProgressHistoryEntry };
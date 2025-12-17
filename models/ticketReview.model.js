import { supabaseAdmin } from "../config/supabaseClient.js";

const TABLE_NAME = "ticket_reviews";


const insertTicketReview = async (reviewData) => {
    const { data, error} = await supabaseAdmin
        .from(TABLE_NAME)
        .insert([reviewData])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

const getReviewsByTicketId = async (ticketId) => {
    const { data, error} = await supabaseAdmin
        .from(TABLE_NAME)
        .select("*")
        .eq("ticket_id", ticketId)
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export { insertTicketReview,getReviewsByTicketId };


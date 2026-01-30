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
    if (error) throw new Error(error.message);
    return data;
}

const getReviewsByTechnicianId = async (technicianId) => {
    console.log("Fetching reviews for Technician ID:", technicianId); // Debug Log

    // SIMPLIFIED QUERY: Fetch ONLY the reviews table. 
    // We removed 'tickets(...)' and 'profiles(...)' to stop the crashing.
    const { data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .select(`
        id,
        rating,
        review,
        created_at,
        ticket_id,
        tickets:ticket_id (
            id,
            ticket_id,
            title,
            complaint,
            status,
            priority,
            resident_name,
            created_at,
            location
        )
        `)
        .eq("technician_id", technicianId)
        .order("created_at", { ascending: false });

    

    if (error) {
        console.error("Supabase Error:", error.message);
        throw new Error(error.message);
    }

    return data;
}

export { insertTicketReview, getReviewsByTicketId, getReviewsByTechnicianId }



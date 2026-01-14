import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

const TABLE_NAME = "tickets";

const getAllTickets = async (user) => {
    let query = supabaseAdmin
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

    if(user.role === "resident"){
        query = query.eq("resident_id", user.id);
    }

    if(user.role === "technician"){
        query = query.eq("technician_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

const getTicketById = async (ticketId) => {
    const { data,error} = await supabaseAdmin
        .from(TABLE_NAME)
        .select("*")
        .eq("id", ticketId)
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

const addTicketData = async (ticketData) => {
    const { data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .insert([ticketData])
        .select()
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

const updateTicket = async (ticketId, updateData) => {
    const { data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .update(updateData)
        .eq("id", ticketId)
        .select()
        .single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

/**
 * Fetch tickets created in a specific month and year
 * @async
 * @param {number} year - The year to filter tickets by
 * @param {number} month - The month to filter tickets by (1-12)
 * @returns {Promise<Array<Object>>} Array of ticket objects created in the specified month and year
 * @throws {Error} Throws an error if the database query fails
 */
const getTicketsByCreatedMonth = async (year, month) => {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 1).toISOString();

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("*")
        .gte("created_at", startDate)
        .lt("created_at", endDate)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return data;
}

/**
 * Technician accepts a ticket (atomic – first accept wins)
 */
const acceptTicketByTechnician = async (ticketId, technicianId) => {
        const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
        technician_id: technicianId,
        status: "assigned"
    })
    .eq("id", ticketId)
    .eq("status", "open")
    .select()
    .maybeSingle();

    if (!data) {
    return null; // truly not updated
    }

    return data;

};


export { getAllTickets, addTicketData, getTicketsByCreatedMonth,getTicketById,updateTicket,acceptTicketByTechnician };
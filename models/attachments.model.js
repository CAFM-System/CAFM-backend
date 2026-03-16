import { supabaseAdmin } from "../config/supabaseClient.js"
const TABLE_NAME = "ticket_attachments"

const addAtachments = async (attachment) => {
    const {data,error} = await supabaseAdmin
        .from(TABLE_NAME)
        .insert([attachment])
        .select()
        .single();

    if(error){
        throw new Error(error.message);
    }
    return data;
}

const getAttachmentsByTicketId = async (ticketId) => {
    const {data,error} = await supabaseAdmin
        .from(TABLE_NAME)
        .select("*")
        .eq("ticket_id", ticketId);
    if(error){
        throw new Error(error.message);
    }
    return data;
}


export { addAtachments , getAttachmentsByTicketId};



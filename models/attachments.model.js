import { supabase } from "../config/supabaseClient.js"
const TABLE_NAME = "ticket_attachments"

const addAtachments = async (attachment) => {
    const {data,error} = await supabase
        .from(TABLE_NAME)
        .insert([attachment])
        .select()
        .single();

    if(error){
        throw new Error(error.message);
    }
    return data;
}

export { addAtachments };
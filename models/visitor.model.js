import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

const TABLE_NAME = 'visitors';

const createVisitor = async (visitorData) => {
    const{ data, error } = await supabaseAdmin
        .from(TABLE_NAME)
        .insert(visitorData)
        .select()
        .single();
    if (error) {
        throw new Error('Error creating visitor: ' + error.message);
    }
    return data;
}

export { createVisitor };
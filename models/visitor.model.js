import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

const TABLE_NAME = 'visitors';

const createVisitor = async (visitorData) => {
    console.log("Current Key Role:", JSON.parse(Buffer.from(process.env.SUPABASE_SERVICE_ROLE_KEY.split('.')[1], 'base64').toString()).role);
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
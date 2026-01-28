import { supabaseAdmin } from "../config/supabaseClient.js";

 const createvisitorQr = async(qr)=>{
    const{ data, error } = await supabaseAdmin
        .from("visitor_qr")
        .insert(qr)
        .select()
        .single();
    if (error) {
        throw new Error('Error creating visitor QR: ' + error.message);
    }
    return data;
 }


    export { createvisitorQr };
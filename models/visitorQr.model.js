import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

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

const findQrByToken = async (token) => {
  const { data, error } = await supabaseAdmin
    .from("visitor_qr")
    .select(`
      id,
      token,
      valid_from,
      valid_until,
      is_used,
      status,
      visitors:visitor_id (
        id,
        full_name,
        visitor_type
      )
    `)
    .eq("token", token)
    .maybeSingle();

    console.log(data, error);

    

  if (error) {
    throw new Error(
      "Error finding visitor QR by token: " + error.message
    );
  }

  return data;
};

 const markQrAsUsed = async(id)=>{
    const{ data, error } = await supabaseAdmin
        .from("visitor_qr")
        .update({ is_used: true ,status:'USED'})
        .eq("id", id)
        .single();
    if (error) {
        throw new Error('Error marking visitor QR as used: ' + error.message);
    }
    return data;
 }


export { createvisitorQr, findQrByToken, markQrAsUsed };
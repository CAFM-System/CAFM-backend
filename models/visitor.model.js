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


const getVisitors = async () => {
  const { data, error } = await supabase
    .from("visitors")
    .select(`
      *,
      residents (
        apartment_no,
        profiles (
          first_name,
          last_name,
          phone
        )
      ),
      visitor_qr (
        valid_from,
        valid_until,
        status,
        is_used
      )
    `);

      if (error) throw new Error(error.message);

  const formattedVisitors = data.map((visitor) => {
    const resident = visitor.residents;
    const profile = resident?.profiles;
    const latestQR = visitor.visitor_qr?.[0]; // first QR (or latest if ordered)

    return {
      id: visitor.id,
      name: visitor.full_name,
      nic: visitor.id_number,
      phone: visitor.phone,
      email: visitor.email,
      visitorType: visitor.visitor_type?.toLowerCase(),
      isPreRegistered: visitor.is_pre_registered ?? false,
      date: visitor.created_at
        ? new Date(visitor.created_at).toISOString().split("T")[0]
        : null,
      entryTime: visitor.entry_time || null,

      hostName: profile
        ? `${profile.first_name} ${profile.last_name}`
        : null,

      hostApartment: resident?.apartment_no || null,
      hostPhone: profile?.phone || null,

      vehicleNumber: visitor.vehicle_number,
      othersCount: visitor.others_count ?? 0,

      // optional QR info if needed
      qrValidFrom: latestQR?.valid_from || null,
      qrValidUntil: latestQR?.valid_until || null,
      qrStatus: latestQR?.status || null,
    };
  });

  return formattedVisitors;

  
};

export { createVisitor, getVisitors };
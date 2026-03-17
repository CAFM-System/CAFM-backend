import { supabase, supabaseAdmin } from "../config/supabaseClient.js";

const TABLE_NAME = 'visitors';

const createVisitor = async (visitorData) => {
  console.log("Current Key Role:", JSON.parse(Buffer.from(process.env.SUPABASE_SERVICE_ROLE_KEY.split('.')[1], 'base64').toString()).role);
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
      validFrom: latestQR?.valid_from || null,
      validUntil: latestQR?.valid_until || null,
      qrStatus: latestQR?.status || null,
      visitor_id: visitor.visitor_id
    };
  });

  return formattedVisitors;


};


const getVisitorsByResident = async (residentId) => {
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
    `)
    .eq("resident_id", residentId);   // 🔹 filter here

  if (error) throw new Error(error.message);

  const formattedVisitors = data.map((visitor) => {
    const resident = visitor.residents;
    const profile = resident?.profiles;
    const latestQR = visitor.visitor_qr?.[0];

    return {
      id: visitor.id,
      visitorId: visitor.visitor_id,
      fullName: visitor.full_name,
      idNumber: visitor.id_number,
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
      numberOfOthers: visitor.others_count ?? 0,

      visitDate: latestQR?.valid_from || null,
      qrValidUntil: latestQR?.valid_until || null,
      qrStatus: latestQR?.status || null,
    };
  });

  return formattedVisitors;
};

const updateVisitorByResidentIDandVisitorID = async (visitorId, updateData) => {
  console.log("Updating Visitor with ID:", visitorId, "Update Data:", updateData);
  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .update(updateData)
    .eq("visitor_id", visitorId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error('Error updating visitor: ' + error.message);
  }
  return data;
}

const updateVisitorCheckinStatus = async (visitorId, checkinData) => {
  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .update(checkinData)
    .eq("id", visitorId)
    .select()
    .single();

  if (error) {
    throw new Error('Error updating visitor check-in status: ' + error.message);
  }
  return data;
}

const deleteVisitorByResidentIDandVisitorID = async (visitorId) => {
  console.log("Deleting Visitor with ID:", visitorId);
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("visitor_id", visitorId)
    .select()
    .single();

  if (error) {
    throw new Error('Error deleting visitor: ' + error.message);
  }
  console.log("Deleted Visitor:", data);
  return data;
}

export { createVisitor, getVisitors, getVisitorsByResident, updateVisitorByResidentIDandVisitorID, deleteVisitorByResidentIDandVisitorID, updateVisitorCheckinStatus };
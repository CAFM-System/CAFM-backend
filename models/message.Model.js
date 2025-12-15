import { supabaseAdmin } from "../config/supabaseClient.js";

//Get ticket details with resident phone information
 
export const getTicketWithContacts = async (ticketId) => {
  const { data, error } = await supabaseAdmin
    .from('tickets')
    .select(`
      id,
      ticket_id,
      job_type,
      resident_name,
      location,
      status,
      complaint,
      
      resident:residents!tickets_resident_id_fkey(
        user_id,
        profiles:profiles!inner(phone, first_name, last_name)
      )
    `)
    .eq('id', ticketId)
    .single();

  if (error) {
    console.error('Error fetching ticket contacts:', error);
    return null;
  }

  return {
    id: data.id,
    ticket_id: data.ticket_id,
    job_type: data.job_type,
    resident_name: data.resident_name,
    location: data.location,
    status: data.status,
    complaint: data.complaint,
    resident: {
      resident_id: data.resident.user_id,
      resident_name: `${data.resident.profiles.first_name} ${data.resident.profiles.last_name}`,
      resident_phone: data.resident.profiles.phone
    }
  };
};


 // Get all admin phone numbers

export const getAllAdmins = async () => {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select(`
      user_id,
      profiles:profiles!inner(phone, first_name, last_name)
    `);

  if (error) {
    console.error('Error fetching admins:', error);
    return [];
  }

  return data.map(admin => ({
    admin_id: admin.user_id,
    admin_name: `${admin.profiles.first_name} ${admin.profiles.last_name}`,
    admin_phone: admin.profiles.phone
  }));
};


 // Get technician details by user_id
 
export const getTechnicianProfile = async (technicianId) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('phone, first_name, last_name')
    .eq('user_id', technicianId)
    .single();

  if (error || !data) {
    console.error('Error fetching technician profile:', error);
    return null;
  }

  return {
    technician_id: technicianId,
    technician_name: `${data.first_name} ${data.last_name}`,
    technician_phone: data.phone
  };
};


 // Create a new ticket in the database
 
export const createTicketRecord = async (ticketData) => {
  const { data, error } = await supabaseAdmin
    .from("tickets")
    .insert([ticketData])
    .select()
    .single();

  if (error) {
    throw {
      message: error.message,
      details: error.details,
      hint: error.hint
    };
  }

  return data;
};


 // Update ticket with technician assignment

export const assignTechnicianToTicket = async (ticketId, technicianName) => {
  const { data, error } = await supabaseAdmin
    .from("tickets")
    .update({ 
      status: "assigned",
      reported_to: technicianName
    })
    .eq("ticket_id", ticketId)
    .select("id, ticket_id, complaint, location, job_type")
    .single();

  if (error || !data) {
    throw new Error(error ? error.message : "Ticket not found");
  }

  return data;
};


 // Update ticket status and optional fields
 
export const updateTicketStatusRecord = async (ticketId, updateData) => {
  const { error } = await supabaseAdmin
    .from("tickets")
    .update(updateData)
    .eq("ticket_id", ticketId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};


 // Get ticket by ticket_id (for status updates)
export const getTicketByTicketId = async (ticketId) => {
  const { data, error } = await supabaseAdmin
    .from("tickets")
    .select("id")
    .eq("ticket_id", ticketId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
};
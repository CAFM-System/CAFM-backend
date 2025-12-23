const newTicketAdminSMS = (ticket) => {
    return `CAFM Alert: New ticket ${ticket.ticket_id || 'created'}. Category: ${ticket.complaint_category}. Please assign technician.`;
};

const technicianAssignmentSMS = (ticket) => {
    return `CAFM: Ticket ${ticket.ticket_id} assigned to you. Priority: ${ticket.priority}. Category: ${ticket.complaint_category}.`;
};

const residentAssignedSMS = (ticket) => {
    return `CAFM: Technician assigned to ticket ${ticket.ticket_id}. Priority: ${ticket.priority}. They will contact you soon.`;
};

const ticketUpdatedSMS = (ticket, updateMessage) => {
    return `CAFM: Ticket ${ticket.ticket_id} updated. Status: ${ticket.status}. ${updateMessage}`;
};

export { 
    newTicketAdminSMS, 
    technicianAssignmentSMS, 
    residentAssignedSMS,
    ticketUpdatedSMS
};
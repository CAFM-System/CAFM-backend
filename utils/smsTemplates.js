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

const closedTicketSMS = (ticket) => {
    return `CAFM: Ticket ${ticket.ticket_id} has been closed.`;
}

const reOpenTicketSMS = (ticket) => {
    return `CAFM: Ticket ${ticket.ticket_id} has been reopened.`;
}

const technicianworkStartedSMS = (ticket, startTime) => {
    return `CAFM: Work started on your ticket ${ticket.ticket_id} at ${startTime}.`;
}

const resolvedTicketSMS = (ticket, resolveTime) => {
    return `CAFM: Your ticket ${ticket.ticket_id} has been resolved at ${resolveTime}.`;
}

const technicianAcceptedAdminSMS = (ticket) => {
    return `CAFM Alert: Technician has accepted ticket ${ticket.ticket_id}.`;
}

const technicianAcceptedResidentSMS = (ticket) => {
    return `CAFM: A technician has accepted your ticket ${ticket.ticket_id}.`;
}


export { 
    newTicketAdminSMS, 
    technicianAssignmentSMS, 
    residentAssignedSMS,
    ticketUpdatedSMS,
    closedTicketSMS,
    reOpenTicketSMS,
    technicianworkStartedSMS,
    resolvedTicketSMS,
    technicianAcceptedAdminSMS,
    technicianAcceptedResidentSMS
};
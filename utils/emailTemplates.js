const newTicketAdminEmail = (ticket)=>{
   return `<h3>New Ticket Created</h3>
  <p><b>Ticket ID:</b> ${ticket.ticket_id}</p>
  <p><b>Complaint:</b> ${ticket.complaint}</p>
  <p><b>Location:</b> ${ticket.location}</p>`
};

const technicianAssignmentEmail = (ticket)=>{
    return`<h3>Tickets Assigned<h3>
    <p>You have been assigned ticket ID: <b>${ticket.ticket_id}</b></p>`
};


const residentAssignedEmail = (ticket)=>{
    return`<h3>Technician Assigned</h3>
    <p>A technician has been assigned to your ticket ID: <b>${ticket.ticket_id}</b>.</p>`
};

const statusUpdateEmail = (ticket, status)=>{
    return`<h3>Ticket Status Updated</h3>
    <p>Your ticket ID: <b>${ticket.ticket_id}</b> status has been updated to <b>${status}</b>.</p>`
};

const technicianworkStartedEmail = (ticket, startTime)=>{
    return`<h3>Work Started on Your Ticket</h3>
    <p>The technician has started work on your ticket ID: <b>${ticket.ticket_id}</b> at <b>${startTime}</b>.</p>`
}

const resolvedTicketEmail = (ticket, resolveTime)=>{
    return`<h3>Ticket Resolved</h3>
    <p>Your ticket ID: <b>${ticket.ticket_id}</b> has been resolved at <b>${resolveTime}</b>.</p>`
}

const closedTicketEmail = (ticket)=>{
    return`<h3>Ticket Closed</h3>
    <p><b>${ticket.ticket_id}</b> has been closed.</p>`
}

export {
    newTicketAdminEmail,
    technicianAssignmentEmail,
    residentAssignedEmail,
    statusUpdateEmail,
    technicianworkStartedEmail,
    resolvedTicketEmail,
    closedTicketEmail
};
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

const reOpenTicketEmail = (ticket)=>{
    return`<h3>Ticket Reopened</h3>
    <p><b>${ticket.ticket_id}</b> has been reopened.</p>`
}

const technicianBroadcastEmail = (ticketId, acceptUrl) => {
  return `
    <div style="
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.6;
      background-color: #FCF9EA;
      padding: 24px;
      border-radius: 10px;
      color: #334443;
      max-width: 600px;
      margin: 0 auto;
    ">

      <h2 style="
        color: #334443;
        margin-bottom: 16px;
      ">
        🔔 New Ticket Available
      </h2>

      <p style="margin-bottom: 12px;">
        A new ticket matching your job type has been created.
      </p>

      <p style="margin-bottom: 12px;">
        <strong>Ticket ID:</strong> ${ticketId}
      </p>

      <p style="margin-bottom: 20px;">
        Click the button below to accept this ticket.
        <br />
        <strong style="color:#F0A500;">
          Note:
        </strong>
        The ticket will be assigned to the
        <em>first technician who accepts it</em>.
      </p>

      <a
        href="${acceptUrl}"
        style="
          display: inline-block;
          padding: 14px 26px;
          background-color: #F0A500;
          color: #334443;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
        "
      >
        ✅ Accept Ticket
      </a>

      <p style="
        margin-top: 28px;
        font-size: 12px;
        color: #334443;
        opacity: 0.8;
      ">
        If you did not expect this email, you can safely ignore it.
      </p>

    </div>
  `;
};

const technicianAcceptedAdminEmail = (ticket) => {
  return `
    <h3>Technician Accepted Ticket</h3>
    <p>Technician has accepted ticket ID: <b>${ticket.ticket_id}</b>.</p>
  `;
}

const technicianAcceptedResidentEmail = (ticket) => {
  return `
    <h3>Technician Accepted Your Ticket</h3>
    <p>A technician has accepted your ticket ID: <b>${ticket.ticket_id}</b>.</p>
  `;
}

export {
    newTicketAdminEmail,
    technicianAssignmentEmail,
    residentAssignedEmail,
    statusUpdateEmail,
    technicianworkStartedEmail,
    resolvedTicketEmail,
    closedTicketEmail,
    reOpenTicketEmail,
    technicianBroadcastEmail,
    technicianAcceptedAdminEmail,
    technicianAcceptedResidentEmail
};
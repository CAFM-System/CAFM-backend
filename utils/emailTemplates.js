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

const visitorQrEmail = (
  fullName,
  validFrom,
  validUntil
) => {
  return `
    <div style="
      max-width: 600px;
      margin: auto;
      background-color: #FCF9EA;
      font-family: Arial, Helvetica, sans-serif;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e5e2d6;
    ">

      <!-- Header -->
      <div style="
        background-color: #334443;
        padding: 20px;
        text-align: center;
        color: #FCF9EA;
      ">
        <h2 style="margin: 0;">Visitor Access QR Code</h2>
      </div>

      <!-- Body -->
      <div style="padding: 24px; color: #334443;">
        <p style="font-size: 15px;">
          Hello <strong>${fullName}</strong>,
        </p>

        <p style="font-size: 14px; line-height: 1.6;">
          Please present the QR code below at the security entrance.
          This QR is system-generated and will be validated upon scanning.
        </p>

        <!-- QR Box -->
        <div style="
          text-align: center;
          margin: 24px 0;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 6px;
          border: 2px dashed #F0A500;
        ">
          <img
            src="cid:visitorqr"
            alt="Visitor QR Code"
            style="width: 220px; height: 220px;"
          />
        </div>

        <!-- Validity -->
        <div style="
          background-color: #F0A500;
          padding: 14px;
          border-radius: 6px;
          color: #334443;
          font-size: 14px;
        ">
          <strong>Validity Period</strong><br />
          From: ${validFrom || "N/A"}<br />
          Until: ${validUntil || "Single use"}
        </div>

        <p style="
          margin-top: 20px;
          font-size: 13px;
          color: #555;
        ">
          ⚠️ Do not share this QR code with others.  
          Unauthorized use or expired QR codes will be denied entry.
        </p>
      </div>

      <!-- Footer -->
      <div style="
        background-color: #334443;
        padding: 14px;
        text-align: center;
        font-size: 12px;
        color: #FCF9EA;
      ">
        CAFM Visitor Management System<br />
        <span style="opacity: 0.8;">This is an automated email. Please do not reply.</span>
      </div>
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
    technicianAcceptedResidentEmail,
    visitorQrEmail
};
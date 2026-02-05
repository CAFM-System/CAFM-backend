const ticketsPDF = (tickets, data) => {
    const { by, year, month } = data;

    const date = new Date().toLocaleString();
    let header_month;

    if (by === "all")
        header_month = "All Tickets";
    else
        header_month = new Date(year, month - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });

    const tableRows = tickets
        .map((ticket, idx) => {
            const {...rest } = ticket;

            return `
                <tr>
                    <td>${idx + 1}</td>
                    ${Object.values(rest)
                    .map(val => `<td>${val ?? ""}</td>`)
                    .join("")}
                </tr>
            `;
        })
        .join("");

    const headers = Object.keys(tickets[0])
        .filter(h => h !== "ticket_updates")
        .map(h => `<th>${h}</th>`)
        .join("");

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <style>
                * {
                    padding: 0;
                    margin: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: Arial, sans-serif;
                    font-size: 11px;
                }

                h2 {
                    text-align: center;
                    color: #333;
                }

                .table-container {
                    width: 100%;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 5px;
                    background: white;
                }

                th {
                    background: #78C841;
                    color: white;
                    padding: 8px;
                    font-size: 11px;
                    border: 1px solid #ddd;
                }

                td {
                    padding: 6px;
                    font-size: 11px;
                    border: 1px solid #ddd;
                    text-align: left;
                }

                tr:nth-child(even) {
                    background: #f2f2f2;
                }

                .date {
                    margin-top: 20px;
                    margin-left: 5px;
                    font-size: 11px;
                    color: #555;
                }
            </style>
        </head>

        <body>
            <h2>MANAGEMENT CORPORATION - CONDOMINIUM PLAN NO. 4095</h2>
            <h2>PRIME RESIDENCIES - THE GRAND, WARD PLACE</h2>
            <h2>COMPLAINT LOG - ${header_month}</h2>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            ${headers}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div class="date">Generated on: ${date}</div>
        </body>
        </html>
    `;
};

export default ticketsPDF;
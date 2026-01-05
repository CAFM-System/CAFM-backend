import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

const generateExcel = async (tickets, options) => {
    const {by = "all", year, month} = options || {};

    const date = new Date().toISOString().replace(/[:.]/g, "-");
    const exportDir = path.join(process.cwd(), "exports");
    const filePath = path.join(exportDir, `tickets_${date}.xlsx`);

    if(!fs.existsSync(exportDir)){
        fs.mkdirSync(exportDir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tickets");

    // Title
    let title;
    if(by === "all" || by === "year "){
        title = "COMPLAINT LOG - ALL TICKETS";
    }else if (by === "month" && year && month){
        title = `COMPLAINT LOG - ${new Date(
            year, month - 1
        ).toLocaleString("default", { month: "long", year: "numeric" })}`;
    }else{
        title = "COMPLAINT LOG";
    }


    worksheet.mergeCells("A1:N1");
    worksheet.getCell("A1").value = title;
    worksheet.getCell("A1").font = { size: 14, bold: true };
    worksheet.getCell("A1").alignment = {  horizontal: "center" };

    worksheet.addRow([]);

    // Headers
    const headers = Object.keys(tickets[0]);

    // Add header row manually
    const headerRow = worksheet.addRow(headers);

    // Initially set column keys
    worksheet.columns = headers.map(key => ({
        key
    }));

    //Header style
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF78C841" }
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    // Data rows
    tickets.forEach((ticket) => {
        const row = worksheet.addRow(ticket);
        row.eachCell((cell) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });
    });

    // Footer
    worksheet.addRow([]);
    worksheet.addRow([`Generated on: ${new Date().toLocaleString()}`]);

    // Auto-fit columns widths
    headerRow.eachCell((cell, colIndex) => {
        let maxLength = cell.value ? cell.value.toString().length : 10;

        worksheet.getColumn(colIndex).eachCell({ includeEmpty: false }, (dataCell, rowNumber) => {
            if (rowNumber > 3) {
            const cellValue = dataCell.value ? dataCell.value.toString() : "";
            maxLength = Math.max(maxLength, cellValue.length);
            }
        });

        worksheet.getColumn(colIndex).width = Math.min(Math.max(maxLength * 1.2, 12), 60);
    });


    await workbook.xlsx.writeFile(filePath);

    return filePath;
};

export default generateExcel;

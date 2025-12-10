import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import ticketsPDF from "./PDF.js";

const generatePDF = async (tickets, header) => {
    const date = new Date().toISOString();
    const filePath = path.join("exports", `tickets_${date}.pdf`);

    if (!fs.existsSync("exports")) fs.mkdirSync("exports");

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        timeout: 60000
    });

    const page = await browser.newPage();

    const htmlContent = ticketsPDF(tickets, header);

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: filePath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: "20px",
            bottom: "20px",
            left: "20px",
            right: "20px"
        }
    });

    await browser.close();

    return filePath;
}

export default generatePDF;
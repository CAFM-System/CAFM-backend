import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import ticketsPDF from "./PDF.js";

const generatePDF = async (tickets, header) => {
  const date = new Date().toISOString().replace(/[:.]/g, "-"); // safe filename
  const filePath = path.join("exports", `tickets_${date}.pdf`);

  if (!fs.existsSync("exports")) fs.mkdirSync("exports");

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,        // safe for Windows
      args: [
        '--no-sandbox',      // optional
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    const htmlContent = ticketsPDF(tickets, header);

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
    });

    return filePath;
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw new Error("PDF generation failed");
  } finally {
    if (browser) await browser.close();
  }
};

export default generatePDF;

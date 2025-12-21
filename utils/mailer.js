import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transpoter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text) => {
    return transpoter.sendMail({
        from:`"CAFM System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};

export { sendEmail };
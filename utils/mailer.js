import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({to, subject,html,attachments = []}) => {
    if(!to){
        throw new Error("sendEmail called without recipient 'to' address");
    }
    return transporter.sendMail({
        from:`"CAFM System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments 
    });
};

export { sendEmail };
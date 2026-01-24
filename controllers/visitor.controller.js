import { notifyVisitor } from "../models/notification.model.js";
import { createVisitor } from "../models/visitor.model.js";
import { createvisitorQr } from "../models/visitorQr.model.js";
import { visitorQrEmail } from "../utils/emailTemplates.js";
import { genarateQrToken } from "../utils/qrService.js";
import QRCode from "qrcode";

const preRegisterVisitor = async (req, res) => {
    try {
        const {full_name,phone,email,id_number,vehicle_number,visitor_type,valid_from,valid_until}= req.body;
        const visitorData = {
            resident_id: req.user.id,
            full_name,
            phone,
            email,
            id_number,
            vehicle_number,
            visitor_type,
        }
        const newVisitor = await createVisitor(visitorData);
        

        const token = genarateQrToken({
            visitor_id: newVisitor.id,
            visitor_type: newVisitor.visitor_type,
        })

        await createvisitorQr({
            visitor_id: newVisitor.id,
            token: token,
            valid_from,
            valid_until
        })
        const qrData = `${process.env.FRONTEND_URL}/scan?token=${token}`.trim();
        const qrBuffer = await QRCode.toBuffer(qrData);


        await notifyVisitor(
            email,
            phone,
            "Your Visitor QR Code",
            visitorQrEmail(full_name, valid_from, valid_until),
            qrBuffer
        )

        res.status(200).json({
            message: "Visitor pre-registered successfully. QR code has been sent to the visitor."
        });
    }catch(error) {
        res.status(500).json({ message: "Failed to pre-register visitor", error: error.message });      
    }
}


export { preRegisterVisitor };
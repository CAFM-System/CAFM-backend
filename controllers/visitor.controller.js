import { notifyVisitor } from "../models/notification.model.js";
import { createVisitor } from "../models/visitor.model.js";
import { createvisitorQr,findQrByToken, markQrAsUsed } from "../models/visitorQr.model.js";
import { visitorQrEmail } from "../utils/emailTemplates.js";
import { genarateQrToken, verifyQrToken } from "../utils/qrService.js";
import QRCode from "qrcode";

const preRegisterVisitor = async (req, res) => {
    try {
        const {full_name,phone,email,id_number,vehicle_number,visitor_type,valid_from,valid_until}= req.body;
        

        if(!visitor_type||!valid_from){
            return res.status(400).json({ message: "visitor_type and valid_from are required fields." });
        }

        if(!["NORMAL","REGULAR"].includes(visitor_type)){
            return res.status(400).json({ message: "Invalid visitor_type. Must be either 'NORMAL' or 'REGULAR'." });
        }

        const visitorData = {
            resident_id: req.user.id,
            full_name,
            phone,
            email,
            id_number,
            vehicle_number,
            visitor_type,
        }
        console.log(visitorData);
        const newVisitor = await createVisitor(visitorData);
        console.log(newVisitor);
        let qrValidFrom;
        let qrValidUntil;
        let jwtExpiresIn;
        if(visitor_type==="NORMAL"){
            const visitDate = new Date(valid_from);
             
            qrValidFrom = new Date(visitDate)
            qrValidFrom.setHours(0,0,0,0);
            console.log(qrValidFrom);

            qrValidUntil = new Date(visitDate)
            qrValidUntil.setHours(23,59,59,999);
            console.log(qrValidUntil);

            jwtExpiresIn = '2d';
        }

        if(visitor_type==="REGULAR"){
            if(!valid_until){
                return res.status(400).json({ message: "valid_until is required for REGULAR visitors." });
            }
            qrValidFrom = new Date(valid_from);
            qrValidUntil = new Date(valid_until);

            if(qrValidUntil <= qrValidFrom){
                return res.status(400).json({ message: "valid_until must be later than valid_from for REGULAR visitors." });
            }

            const diffMs = qrValidUntil - qrValidFrom;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            jwtExpiresIn = `${diffDays + 1}d`; // adding 1 day buffer
        }

        const token = genarateQrToken(
            {
            visitor_id: newVisitor.id,
            visitor_type: newVisitor.visitor_type,
            },
            jwtExpiresIn
        );

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
            message: "Visitor pre-registered successfully. QR code has been sent to the visitor.",
            visitor_type,
            valid_from: qrValidFrom,
            valid_until: qrValidUntil
            
        });
    }catch(error) {
        res.status(500).json({ message: "Failed to pre-register visitor", error: error.message });      
    }
}

const scanVisitorQr = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token is required." });
        }
        verifyQrToken(token);

        const visitorQr = await findQrByToken(token);
        console.log(visitorQr);

        if(!visitorQr || visitorQr.status !== 'ACTIVE'){
            return res.status(400).json({ message: "Invalid or inactive QR code." });
        }

        const now = new Date();
        console.log(now);
        console.log(new Date(visitorQr.valid_from));
        console.log(new Date(visitorQr.valid_until));
        if((now < new Date(visitorQr.valid_from) || now > new Date(visitorQr.valid_until))&& visitorQr.visitors.visitor_type ==='REGULAR'){
            return res.status(400).json({ message: "QR expired" });
        }
        console.log("aDSDdD");
        if(visitorQr.visitors.visitor_type === 'NORMAL'){
            if(visitorQr.is_used){
                return res.status(400).json({ message: "QR already used." });
            }
            await markQrAsUsed(visitorQr.id);
        }

        res.status(200).json({
            message: "Access granted.",
            visitor: {
                name : visitorQr.visitors.full_name,
                type : visitorQr.visitors.visitor_type
            }
        })


    } catch (err) {
         if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "QR token expired" });
    }
    return res.status(401).json({ message: "Invalid QR token" });
    }
}


export { preRegisterVisitor, scanVisitorQr };
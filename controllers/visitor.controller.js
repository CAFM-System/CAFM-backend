import { createVisitor } from "../models/visitor.model.js";

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
        res.status(201).json(newVisitor);
    }catch(error) {
        res.status(500).json({ message: "Failed to pre-register visitor", error: error.message });      
    }
}


export { preRegisterVisitor };
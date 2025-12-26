import { getTechnicians } from "../models/user.model.js";

const getAllTechnicians = async (req, res) => {
    try {
        
        const technicians = await getTechnicians();
        res.status(200).json(technicians);
        console.log("Fetched Technicians:", technicians);
         
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch technicians", error: error.message });
    }
}

export { getAllTechnicians };
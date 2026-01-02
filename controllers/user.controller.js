import { getTechnicians } from "../models/user.model.js";

const getAllTechnicians = async (req, res) => {
    try {
        const {jobType} = req.query;
        console.log(jobType);
        if(!jobType){
            return res.status(400).json({ message: "Job type is required" });
        }
        

        const technicians = await getTechnicians(jobType);
        res.status(200).json(technicians);
        console.log(technicians);
          
        
         
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch technicians", error: error.message });
    }
}

export { getAllTechnicians };
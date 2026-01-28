import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import ticketRouter from "./routes/api/tickets.routes.js";
import ticketReviewRouter from "./routes/api/ticketReview.routes.js";
import router from "./routes/api/progressHistory.routes.js";
import userRouter from "./routes/api/user.routes.js";
import technicianRouter from "./routes/api/technician.routes.js";
import residentRouter from "./routes/api/resident.routes.js";
import utilityRouter from "./routes/api/utility.routes.js";
import authRouter from "./routes/api/auth.routes.js";
import notificationRouter from "./routes/api/notification.routes.js";
import visitorRouter from "./routes/api/visitor.routes.js";
import { supabase } from "./config/supabaseClient.js";


dotenv.config();
const app = express();
/*app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["Content-Disposition"],
  })
);*/

app.use(cors());

// middle man to parse json body
app.use(express.json())

app.use('/api/auth',authRouter)
app.use('/api/tickets',ticketRouter);
app.use('/api/ticket-reviews', ticketReviewRouter);
app.use('/api/progress-history', router);
app.use('/api/users',userRouter)
app.use('/api/technicians',technicianRouter)
app.use('/api/residents',residentRouter)
app.use('/api/utility',utilityRouter)
app.use('/api/notifications',notificationRouter)
app.use('/api/visitors',visitorRouter)


if(supabase){
    console.log("Supabase connected")
}else{
    console.log("Supabase not connected")
}

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", err);
});






app.listen(process.env.PORT,"0.0.0.0",
    ()=>{console.log("Sever is started")

    }
);

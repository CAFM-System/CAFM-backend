import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const genarateQrToken = (data)=>{
    return jwt.sign(data,process.env.QR_SECRET_KEY,{expiresIn:'30d'});

}

const verifyQrToken = (token)=>{
    return jwt.verify(token,process.env.QR_SECRET_KEY);
}

export { genarateQrToken,verifyQrToken };
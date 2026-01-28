import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const genarateQrToken = (data, expiresIn)=>{
    return jwt.sign(
        data,
        process.env.QR_SECRET_KEY,
        {expiresIn}
    );

}

const verifyQrToken = (token)=>{
    return jwt.verify(token,process.env.QR_SECRET_KEY);
}

export { genarateQrToken,verifyQrToken };
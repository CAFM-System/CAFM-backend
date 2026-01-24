import QRCode from "qrcode";

const generateQrBuffer = async (data) => {
  return await QRCode.toBuffer(data);
};

export { generateQrBuffer };

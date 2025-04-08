const nodemailer = require('nodemailer');
require('dotenv').config();
const EMAIL = process.env.MAIL_SEND_OTP;
const PASS = process.env.PASSWORD_MAIL_SEND_OTP;
const generateOTP = () => {
    return otp = Math.floor(100000 + Math.random() * 900000).toString();
};

const getOTPExpiration = () => {
    return Date.now() + 10 * 60 * 1000;
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: PASS,
    },
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: 'LifeMap Chanel',
        to: email,
        subject: 'Xác minh OTP đăng ký tài khoản',
        text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`,
    }
    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
    } catch (error) {
        throw new Error(`Không thể gửi email: ${error.message}`);
    }
}

module.exports = { generateOTP, getOTPExpiration, sendOTP };

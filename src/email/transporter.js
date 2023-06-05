
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({path: '../config/config.env'})

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_NAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const SENDMAIL = async (mailDetails, callback) => {
    try {
      const info = await transporter.sendMail(mailDetails)
      callback(info);
    } catch (error) {
      console.log(error);
    } 
  };
  export default SENDMAIL;

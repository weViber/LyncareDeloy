const moment = require("moment");
const db = require("../models");
const nodemailer = require("nodemailer");
const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD } = require("../common");
const { contact: Contact } = db;

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE, // 메일 보내는 곳
  prot: 465,
  host: "smtp.gmail.com",
  secure: false,
  requireTLS: true,
  auth: {
    user: EMAIL_USER, // 보내는 메일의 주소
    pass: EMAIL_PASSWORD, // 보내는 메일의 비밀번호
  },
});

exports.postEmail = async (req, res) => {
  try {
    const { company, call, email, name, phone, desc } = req.body;
    const sendEmail = await transporter.sendMail({
      from: EMAIL_USER, // sender address
      to: ["lyncare@lyncare.co.kr", "kimkuns98@gmail.com"],
      subject: "Lyncare 문의가 왔습니다",
      html: `<p>company : ${company}</p>
            <p>call : ${call}</p> 
            <p>email : ${email}</p> 
            <p>phone : ${phone}</p> 
            <p>name : ${name}</p> 
            <p>desc : ${desc}</p>`,
    });
    console.log(sendEmail)
    const newContact = new Contact({ company, call, email, name, phone, desc });
    await newContact.save();
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
  }
};

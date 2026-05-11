const moment = require("moment");
const db = require("../models");
const nodemailer = require("nodemailer");
const {
  EMAIL_SERVICE,
  EMAIL_USER,
  EMAIL_PASSWORD,
  RECAPTCHA_SECRET_KEY,
  RECAPTCHA_MIN_SCORE,
} = require("../common");
const { contact: Contact } = db;

const verifyRecaptcha = async (token) => {
  if (!RECAPTCHA_SECRET_KEY) {
    throw new Error("서버에 reCAPTCHA 비밀 키가 설정되지 않았습니다.");
  }
  if (!token) {
    return { success: false, reason: "토큰이 없습니다." };
  }
  const params = new URLSearchParams({
    secret: RECAPTCHA_SECRET_KEY,
    response: token,
  });
  const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await response.json();
  if (!data.success) {
    return { success: false, reason: "reCAPTCHA 검증 실패", data };
  }
  if (data.action && data.action !== "contact_form") {
    return { success: false, reason: "잘못된 reCAPTCHA action", data };
  }
  if (typeof data.score === "number" && data.score < RECAPTCHA_MIN_SCORE) {
    return { success: false, reason: "봇으로 의심되는 요청입니다.", data };
  }
  return { success: true, data };
};

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
    const { company, call, email, name, phone, desc, recaptchaToken } = req.body;

    const verification = await verifyRecaptcha(recaptchaToken);
    if (!verification.success) {
      console.warn("reCAPTCHA 거부:", verification.reason, verification.data);
      return res.status(400).json({ message: verification.reason });
    }

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

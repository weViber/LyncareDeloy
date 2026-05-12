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

const escapeHtml = (value) => {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const EMPTY_CELL = '<span style="color:#9ca3af;">-</span>';

const cellValue = (value) => {
  const trimmed = (value || "").trim();
  return trimmed ? escapeHtml(trimmed) : EMPTY_CELL;
};

const descValue = (value) => {
  const trimmed = (value || "").trim();
  if (!trimmed) return EMPTY_CELL;
  return escapeHtml(trimmed).replace(/\r?\n/g, "<br />");
};

const FONT_STACK = "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',Pretendard,Helvetica,Arial,sans-serif";

const buildEmailHtml = ({ company, call, email, name, phone, desc }) => {
  const receivedAt = moment().utcOffset(9).format("YYYY년 M월 D일 HH:mm");
  const safeEmail = escapeHtml((email || "").trim());
  const replyHref = safeEmail ? `mailto:${safeEmail}` : null;
  const emailDisplay = safeEmail
    ? `<a href="mailto:${safeEmail}" style="color:#00CDA8; text-decoration:none;">${safeEmail}</a>`
    : EMPTY_CELL;

  const rowStyle = `padding:14px 0; border-bottom:1px solid #f1f3f5; font-family:${FONT_STACK};`;
  const labelStyle = `${rowStyle} font-size:13px; color:#6b7280; vertical-align:top; width:110px;`;
  const valueStyle = `${rowStyle} font-size:14px; color:#111827; font-weight:500; vertical-align:top;`;
  const sectionLabel = `font-family:${FONT_STACK}; font-size:11px; color:#00CDA8; font-weight:800; letter-spacing:1.2px; margin-bottom:8px;`;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Lyncare 새 문의</title>
</head>
<body style="margin:0; padding:0; background:#f5f6f7;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
    ${escapeHtml(name || "")}님이 ${escapeHtml(company || "")}에서 문의를 보냈습니다.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f6f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#00CDA8; padding:32px 36px;">
              <div style="font-family:${FONT_STACK}; color:#ffffff; font-size:12px; font-weight:700; letter-spacing:2px; opacity:0.85;">
                LYNCARE CONTACT
              </div>
              <div style="font-family:${FONT_STACK}; color:#ffffff; font-size:24px; font-weight:800; margin-top:10px; letter-spacing:-0.5px;">
                새로운 문의가 도착했습니다
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 36px 0; font-family:${FONT_STACK}; font-size:13px; color:#6b7280;">
              ${receivedAt}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px 0;">
              <div style="${sectionLabel}">COMPANY</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="${labelStyle}">회사명</td>
                  <td style="${valueStyle}">${cellValue(company)}</td>
                </tr>
                <tr>
                  <td style="${labelStyle} border-bottom:none;">회사 전화</td>
                  <td style="${valueStyle} border-bottom:none;">${cellValue(call)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 0;">
              <div style="${sectionLabel}">CONTACT</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="${labelStyle}">담당자</td>
                  <td style="${valueStyle}">${cellValue(name)}</td>
                </tr>
                <tr>
                  <td style="${labelStyle}">휴대폰</td>
                  <td style="${valueStyle}">${cellValue(phone)}</td>
                </tr>
                <tr>
                  <td style="${labelStyle} border-bottom:none;">이메일</td>
                  <td style="${valueStyle} border-bottom:none;">${emailDisplay}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 36px 0;">
              <div style="${sectionLabel}">INQUIRY</div>
              <div style="background:#f9fafb; border:1px solid #f1f3f5; border-radius:8px; padding:18px 20px; font-family:${FONT_STACK}; font-size:14px; color:#374151; line-height:1.75; word-break:break-word;">
                ${descValue(desc)}
              </div>
            </td>
          </tr>
          ${replyHref ? `<tr>
            <td align="center" style="padding:32px 36px 8px;">
              <a href="${replyHref}" style="display:inline-block; background:#00CDA8; color:#ffffff; font-family:${FONT_STACK}; font-size:14px; font-weight:700; padding:13px 36px; border-radius:6px; text-decoration:none; letter-spacing:-0.3px;">
                답장 보내기
              </a>
            </td>
          </tr>` : ""}
          <tr>
            <td style="padding:24px 36px 32px;"></td>
          </tr>
          <tr>
            <td style="background:#fafbfc; padding:18px 36px; text-align:center; font-family:${FONT_STACK}; font-size:11px; color:#9ca3af; border-top:1px solid #f1f3f5; line-height:1.7;">
              이 메일은 Lyncare 홈페이지 문의 양식에서 자동으로 발송되었습니다.<br />
              <a href="https://www.lyncare.co.kr" style="color:#00CDA8; text-decoration:none; font-weight:600;">www.lyncare.co.kr</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

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

    const subjectCompany = (company || "").trim() || "(회사명 미기재)";
    const subjectName = (name || "").trim() || "(담당자 미기재)";
    const sendEmail = await transporter.sendMail({
      from: EMAIL_USER,
      to: ["lyncare@lyncare.co.kr", "kimkuns98@gmail.com"],
      replyTo: (email || "").trim() || undefined,
      subject: `[Lyncare 문의] ${subjectCompany} - ${subjectName}`,
      html: buildEmailHtml({ company, call, email, name, phone, desc }),
    });
    console.log(sendEmail)
    const newContact = new Contact({ company, call, email, name, phone, desc });
    await newContact.save();
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("postEmail error:", error);
    res.status(500).json({ message: "메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
  }
};

const nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
  service: process.env.SMTP_AGENT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

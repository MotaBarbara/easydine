import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailParams) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? '"EasyDine" <no-reply@easydine.app>',
    to,
    subject,
    html,
  });
}

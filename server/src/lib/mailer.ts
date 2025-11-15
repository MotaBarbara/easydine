import nodemailer from "nodemailer";

const isSmtpConfigured = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return (
    host &&
    user &&
    pass &&
    host !== "smtp.yourprovider.com" &&
    user !== "your-user" &&
    pass !== "your-pass"
  );
};

const transporter = isSmtpConfigured()
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

export interface SendMailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailParams) {
  if (!isSmtpConfigured() || !transporter) {
    console.log("\n📧 [EMAIL] (SMTP not configured - email logged instead)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(html.replace(/<[^>]*>/g, ""));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? '"EasyDine" <no-reply@easydine.app>',
    to,
    subject,
    html,
  });
}

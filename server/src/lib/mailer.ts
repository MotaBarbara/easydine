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
    console.warn("\n⚠️  [EMAIL] SMTP not configured - email logged instead");
    console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.warn(`To: ${to}`);
    console.warn(`Subject: ${subject}`);
    console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.warn(html.replace(/<[^>]*>/g, ""));
    console.warn("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.warn("To enable email sending, configure SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables\n");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? '"EasyDine" <no-reply@easydine.app>',
      to,
      subject,
      html,
    });
    console.log(`✅ [EMAIL] Confirmation email sent to ${to}`);
  } catch (error) {
    console.error("❌ [EMAIL] Failed to send email:", error);
    throw error;
  }
}

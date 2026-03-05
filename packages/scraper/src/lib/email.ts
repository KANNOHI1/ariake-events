import nodemailer from "nodemailer";

export type EmailConfig = {
  user: string;
  appPassword: string;
  to: string;
};

export const getEmailConfig = () => {
  const user = process.env.GMAIL_USER ?? "";
  const appPassword = process.env.GMAIL_APP_PASSWORD ?? "";
  const to = process.env.NOTIFICATION_TO ?? "";
  if (!user || !appPassword || !to) return null;
  return { user, appPassword, to } satisfies EmailConfig;
};

export const sendEmail = async (config: EmailConfig, subject: string, body: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.user,
      pass: config.appPassword,
    },
  });
  await transporter.sendMail({
    from: config.user,
    to: config.to,
    subject,
    text: body,
  });
};


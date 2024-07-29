import nodemailer, { SendMailOptions } from "nodemailer";
import config from "config";

import type { SendMailParameters } from "./brevo";

export async function sendMailCatcher(subject, html, { emailTo, cc, bcc, attachment }: SendMailParameters) {
  return await sendMail({
    to: emailTo!.map(({ email }) => email).join(", "),
    cc: cc?.map(({ email }) => email).join(", "),
    bcc: bcc?.map(({ email }) => email).join(", "),
    subject,
    html,
    attachments: attachment?.map((file) => ({ filename: file.name, content: file.content, encoding: "base64" })) || [],
  });
}

const sendMail = async (mailOptions: SendMailOptions) => {
  const transporter = nodemailer.createTransport({
    host: config.MAILCATCHER_HOST,
    port: Number(config.MAILCATCHER_PORT),
    secure: false,
  });

  await transporter.sendMail(mailOptions);
};

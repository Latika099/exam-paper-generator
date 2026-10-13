import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

export const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not configured");
  }
  return new Resend(apiKey);
};

export const sendMail = async (to, subject, html) => {
  const resend = getResendClient();
  const fromAddress = process.env.RESEND_FROM || "onboarding@resend.dev";

  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Resend HTTPS API request timed out after 10s"));
    }, 10000);
  });

  try {
    const response = await Promise.race([
      resend.emails.send({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
      timeoutPromise,
    ]);

    if (response.error) {
      console.error("Resend API error:", response.error);
      throw new Error(response.error.message || "Failed to send email via Resend");
    }

    console.log("Email sent successfully via Resend. Message ID:", response.data?.id);
    return response.data;
  } catch (error) {
    console.error("Error sending email via Resend:", error.message);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
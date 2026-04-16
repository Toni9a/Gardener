import nodemailer from "nodemailer";
import type { QuotePreferences } from "@/types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendQuoteRequestEmail(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  image_url: string | null;
  visualization_url: string | null;
  preferences: QuotePreferences;
}) {
  const { name, email, phone, address, image_url, visualization_url, preferences } = data;

  const prefLines = [
    `Needs improving: ${preferences.needs_improving.join(", ") || "N/A"}`,
    `Add flowers: ${preferences.add_flowers ? "Yes" : "No"}`,
    preferences.add_flowers && preferences.preferred_flowers.length > 0
      ? `Preferred flowers: ${preferences.preferred_flowers.join(", ")}`
      : null,
    `Garden type: ${preferences.garden_type || "N/A"}`,
    preferences.additional_notes ? `Notes: ${preferences.additional_notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <h2>New Quote Request — GardenScene</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;background:#f0fdf4">Name</td><td style="padding:8px">${name}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f0fdf4">Email</td><td style="padding:8px">${email}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f0fdf4">Phone</td><td style="padding:8px">${phone}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f0fdf4">Address</td><td style="padding:8px">${address}</td></tr>
    </table>
    <h3>Garden Preferences</h3>
    <pre style="background:#f8f8f8;padding:12px;border-radius:4px">${prefLines}</pre>
    ${image_url ? `<h3>Uploaded Garden Photo</h3><p><a href="${image_url}">View photo</a></p>` : ""}
    ${visualization_url ? `<h3>AI Transformation</h3><p><a href="${visualization_url}">View visualization</a></p>` : ""}
    <p style="color:#666;font-size:12px;margin-top:24px">Sent from Green Scene website · info@greenscene.uk.net</p>
  `;

  await transporter.sendMail({
    from: `"Green Scene Website" <${process.env.SMTP_USER}>`,
    to: process.env.GREENSCENE_EMAIL,
    replyTo: email,
    subject: `New Quote Request from ${name}`,
    html,
  });
}

import { Resend } from "resend";

const FROM_EMAIL = "ANMAT Website Feedback <onboarding@resend.dev>";
const TO_EMAIL = "Mahmoud.hussien@anmat.sa";
const SUBJECT = "ANMAT Website Templates Feedback";
const ALLOWED_RATINGS = new Set(["Like", "Dislike", "Neutral"]);

function createResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function asText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatFeedbackHtml(value) {
  const text = asText(value);
  if (!text) return "—";
  return escapeHtml(text).replaceAll("\r\n", "<br>").replaceAll("\n", "<br>").replaceAll("\r", "<br>");
}

function safeHttpUrl(value) {
  const text = asText(value);
  if (!text) return "";

  try {
    const url = new URL(text);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.href;
    }
  } catch {
    return "";
  }

  return "";
}

function templateUrlHtml(value) {
  const href = safeHttpUrl(value);
  if (!href) {
    const text = asText(value);
    return text ? escapeHtml(text) : "—";
  }

  const safeHref = escapeHtml(href);
  return `<a href="${safeHref}" style="color:#0c2340;">${safeHref}</a>`;
}

function parseBody(req) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      console.error("Invalid JSON body:", error);
      return null;
    }
  }

  return req.body ?? null;
}

function validationMessage(body) {
  if (!body || typeof body !== "object" || !("templates" in body)) {
    return "Templates are required.";
  }

  if (!Array.isArray(body.templates)) {
    return "Templates must be an array.";
  }

  if (body.templates.length !== 3) {
    return "Exactly 3 template feedback entries are required.";
  }

  for (const template of body.templates) {
    if (!template || typeof template !== "object" || Array.isArray(template)) {
      return "Each template feedback entry must be an object.";
    }

    if (!ALLOWED_RATINGS.has(template.rating)) {
      return "Each template must include a valid rating.";
    }
  }

  return "";
}

function buildEmailHtml(templates) {
  const sections = templates
    .map((template, index) => {
      const title = asText(template.title) || `Template 0${index + 1}`;
      const divider =
        index < templates.length - 1
          ? `<hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0;" />`
          : "";

      return `
        <section>
          <h2 style="margin:0 0 12px;font-size:18px;line-height:1.3;color:#0c2340;">${escapeHtml(title)}</h2>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.5;"><strong>Reaction:</strong> ${escapeHtml(template.rating)}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.5;"><strong>Template URL:</strong> ${templateUrlHtml(template.url)}</p>
          <p style="margin:0 0 6px;font-size:15px;line-height:1.5;font-weight:700;color:#0c2340;">What they liked:</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${formatFeedbackHtml(template.liked)}</p>
          <p style="margin:0 0 6px;font-size:15px;line-height:1.5;font-weight:700;color:#0c2340;">What they didn't like:</p>
          <p style="margin:0;font-size:15px;line-height:1.6;">${formatFeedbackHtml(template.disliked)}</p>
        </section>
        ${divider}
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2933;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;padding:32px 28px;border:1px solid #e5e7eb;">
      <h1 style="margin:0 0 28px;font-size:22px;line-height:1.3;color:#0c2340;">ANMAT Website Templates Feedback</h1>
      ${sections}
    </div>
  </body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  const body = parseBody(req);
  const message = validationMessage(body);

  if (message) {
    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured.");
    return res.status(500).json({
      success: false,
      message: "Failed to send feedback",
    });
  }

  try {
    const { error } = await createResend().emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: SUBJECT,
      html: buildEmailHtml(body.templates),
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send feedback",
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to send feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send feedback",
    });
  }
}

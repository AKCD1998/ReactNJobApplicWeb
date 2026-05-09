const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");
const path = require("path");
const crypto = require("crypto");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
const SUBMIT_URL = process.env.SUBMIT_URL;
const QUICK_CV_SUBMIT_URL = process.env.QUICK_CV_SUBMIT_URL || SUBMIT_URL;
const HR_EMAIL = process.env.HR_EMAIL || process.env.HR_TO_EMAIL;
const LINE_ADMIN_URL = process.env.LINE_NOTIFY_ADMIN_URL || "";
const SENDGRID_API_KEY = process.env.REACTNJOB_SENDGRID_API_KEY;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const CV_FILE_LIMIT = 10 * 1024 * 1024;
const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CV_FILE_LIMIT },
});

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "https://akcd1998.github.io",
];
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowList = allowedOrigins.length ? allowedOrigins : defaultAllowedOrigins;
      if (!origin || allowList.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  })
);
app.use(
  express.json({
    limit: "15mb",
    verify: (req, res, buf) => {
      const url = req.originalUrl || req.url || "";
      if (url.startsWith("/api/line/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const fetchRequest = (...args) => {
  if (typeof fetch !== "function") {
    throw new Error("Fetch is not available in this runtime");
  }
  return fetch(...args);
};

function stripDataUrl(dataUrl) {
  if (!dataUrl) return "";
  const marker = "base64,";
  const idx = dataUrl.indexOf(marker);
  return idx >= 0 ? dataUrl.slice(idx + marker.length) : dataUrl;
}

function verifyLineSignature(req) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) {
    return { ok: true, skipped: true };
  }

  const signature = req.get("x-line-signature");
  if (!signature) {
    return { ok: false, status: 400, error: "Missing x-line-signature header" };
  }

  const raw = req.rawBody;
  if (!raw || !(raw instanceof Buffer)) {
    return { ok: false, status: 400, error: "Missing raw request body for signature verification" };
  }

  const digest = crypto.createHmac("sha256", secret).update(raw).digest("base64");
  const signatureBytes = Buffer.from(signature, "base64");
  const digestBytes = Buffer.from(digest, "base64");

  if (signatureBytes.length !== digestBytes.length) {
    return { ok: false, status: 401, error: "Invalid signature length" };
  }

  const matches = crypto.timingSafeEqual(signatureBytes, digestBytes);
  return matches ? { ok: true } : { ok: false, status: 401, error: "Invalid signature" };
}

function parseCommaList(value) {
  return String(value || "")
    .replace(/[，、؛]/g, ",")
    .split(/[,\n\r]+/)
    .map((entry) => entry.replace(/[\u200B-\u200D\uFEFF]/g, "").trim())
    .filter(Boolean);
}

function maskLineRecipientId(value) {
  const id = String(value || "").trim();
  if (!id) return "";
  if (id.length <= 12) return `${id.slice(0, 4)}...`;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

async function pushLineMessages({ token, to, messages }) {
  const url = "https://api.line.me/v2/bot/message/push";
  const results = [];

  for (const recipientId of to) {
    const res = await fetchRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to: recipientId, messages }),
    });

    const responseText = await res.text().catch(() => "");
    if (!res.ok) {
      console.error(
        "[line] Messaging API push error:",
        maskLineRecipientId(recipientId),
        res.status,
        responseText
      );
    }

    results.push({
      to: maskLineRecipientId(recipientId),
      ok: res.ok,
      status: res.status,
      body: responseText || "",
      error: res.ok ? null : responseText || `LINE Messaging API returned ${res.status}`,
    });
  }

  return results;
}

function formatBangkokDateTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return String(value || "");

  const normalizeDayPeriod = (input) => {
    const raw = String(input || "").toLowerCase();
    const cleaned = raw.replace(/\./g, "");
    return cleaned === "am" || cleaned === "pm" ? cleaned : raw || "am";
  };

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).formatToParts(date);

    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    const day = get("day");
    const month = get("month");
    const year = get("year");
    const hour = get("hour");
    const minute = get("minute");
    const dayPeriod = normalizeDayPeriod(get("dayPeriod"));

    if (day && month && year && hour && minute) {
      return `${day}-${month}-${year} ${hour}.${minute} ${dayPeriod} (GMT+7)`;
    }
  } catch (error) {
    // Fall through to manual formatting.
  }

  const pad2 = (n) => String(n).padStart(2, "0");
  const shifted = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const day = pad2(shifted.getUTCDate());
  const month = pad2(shifted.getUTCMonth() + 1);
  const year = shifted.getUTCFullYear();
  const minute = pad2(shifted.getUTCMinutes());

  let hour24 = shifted.getUTCHours();
  const dayPeriod = hour24 >= 12 ? "pm" : "am";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;

  return `${day}-${month}-${year} ${pad2(hour12)}.${minute} ${dayPeriod} (GMT+7)`;
}

function formatBangkokDateTimeThai(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return String(value || "");

  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);

    const get = (type) => parts.find((p) => p.type === type)?.value || "";
    const day = get("day");
    const month = get("month");
    const year = get("year");
    const hourRaw = get("hour");
    const minute = get("minute");
    const hour = hourRaw === "24" ? "00" : hourRaw;

    if (day && month && year && hour && minute) {
      return `${day}/${month}/${year} ${hour}:${minute} น. (GMT+7)`;
    }
  } catch (error) {
    // Fall through to manual formatting.
  }

  const pad2 = (n) => String(n).padStart(2, "0");
  const shifted = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const day = pad2(shifted.getUTCDate());
  const month = pad2(shifted.getUTCMonth() + 1);
  const year = shifted.getUTCFullYear();
  const hour = pad2(shifted.getUTCHours());
  const minute = pad2(shifted.getUTCMinutes());

  return `${day}/${month}/${year} ${hour}:${minute} น. (GMT+7)`;
}

function buildLineJobApplicationText(fields) {
  const time = fields.clientTime || new Date().toISOString();
  const adminUrl = fields.adminUrl || LINE_ADMIN_URL;
  const lines = ["📩 แจ้งเตือนผู้สมัครงาน"];

  if (fields.fullName) lines.push(`ชื่อ: ${fields.fullName}`);
  if (fields.positionApplied) lines.push(`ตำแหน่ง: ${fields.positionApplied}`);
  if (fields.phone) lines.push(`โทรศัพท์: ${fields.phone}`);
  if (fields.email) lines.push(`อีเมล: ${fields.email}`);
  lines.push(`เวลา: ${formatBangkokDateTime(time)}`);
  if (adminUrl) lines.push(`ลิงก์ดูรายละเอียด: ${adminUrl}`);

  return lines.join("\n");
}

async function sendLineMessage({ messages }) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return { ok: false, skipped: true, error: "Missing LINE_CHANNEL_ACCESS_TOKEN" };
  }

  const mode = String(process.env.LINE_NOTIFY_MODE || "multicast")
    .trim()
    .toLowerCase();
  const userIds = Array.from(new Set(parseCommaList(process.env.LINE_NOTIFY_USER_IDS)));

  const baseUrl = "https://api.line.me/v2/bot/message";
  let url = "";
  let body = null;

  if (mode === "broadcast") {
    url = `${baseUrl}/broadcast`;
    body = { messages };
  } else if (mode === "push") {
    if (!userIds.length) {
      return { ok: false, skipped: true, error: "Missing LINE_NOTIFY_USER_IDS for push mode" };
    }
    url = `${baseUrl}/push`;
  } else {
    if (!userIds.length) {
      return { ok: false, skipped: true, error: "Missing LINE_NOTIFY_USER_IDS for multicast mode" };
    }
    url = `${baseUrl}/multicast`;
    body = { to: userIds, messages };
  }

  try {
    if (mode === "push") {
      const results = await pushLineMessages({ token, to: userIds, messages });
      const allOk = results.every((entry) => entry.ok);
      return allOk ? { ok: true, results } : { ok: false, results };
    }

    const res = await fetchRequest(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const responseText = await res.text().catch(() => "");
    if (!res.ok) {
      console.error("[line] Messaging API error:", res.status, responseText);

      if (mode === "multicast" && userIds.length > 1) {
        console.warn(
          "[line] Multicast failed; falling back to push:",
          userIds.map(maskLineRecipientId).join(", ")
        );
        const results = await pushLineMessages({ token, to: userIds, messages });
        const allOk = results.every((entry) => entry.ok);
        return allOk
          ? { ok: true, fallback: "push", multicastStatus: res.status, results }
          : { ok: false, fallback: "push", multicastStatus: res.status, results };
      }

      return {
        ok: false,
        status: res.status,
        body: responseText || "",
        error: responseText || `LINE Messaging API returned ${res.status}`,
      };
    }

    return { ok: true, status: res.status, body: responseText || "" };
  } catch (error) {
    console.error("[line] Messaging API request failed:", error);
    return { ok: false, status: 500, error: error.message || "LINE request failed" };
  }
}

async function forwardToAppsScript(payload) {
  if (!SUBMIT_URL) {
    return { ok: false, status: 500, body: "Missing SUBMIT_URL" };
  }

  try {
    const res = await fetchRequest(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.text();
    console.log("GAS response:", res.status, body);

    return { ok: res.ok, status: res.status, body };
  } catch (error) {
    console.error("GAS ERROR:", error);
    return { ok: false, status: 500, body: error.message || "Failed to reach GAS" };
  }
}

async function forwardQuickCvToAppsScript(payload) {
  if (!QUICK_CV_SUBMIT_URL) {
    return { ok: false, status: 500, body: "Missing QUICK_CV_SUBMIT_URL" };
  }

  try {
    const res = await fetchRequest(QUICK_CV_SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = await res.text();
    let json = null;
    try {
      json = JSON.parse(body);
    } catch (parseError) {
      json = null;
    }

    console.log("[cv] GAS response:", res.status, body);
    return { ok: res.ok, status: res.status, body, json };
  } catch (error) {
    console.error("[cv] GAS ERROR:", error);
    return { ok: false, status: 500, body: error.message || "Failed to reach GAS" };
  }
}

async function sendResumeEmail(payload, resumeFile) {
  if (!resumeFile) return { ok: true, skipped: true };

  if (!SENDGRID_API_KEY || !HR_EMAIL || !process.env.FROM_EMAIL) {
    return { ok: false, skipped: false, error: "Missing SendGrid configuration" };
  }

  const subjectName = payload.fullName || "Unknown";
  const subjectPosition = payload.positionApplied || "Unknown position";
  const safeResumeName = sanitizeFilename(resumeFile.originalname);

  const html = `
    <h2>Resume upload</h2>
    <p><b>ชื่อ:</b> ${payload.fullName || "-"}</p>
    <p><b>อีเมล:</b> ${payload.email || "-"}</p>
    <p><b>โทร:</b> ${payload.phone || "-"}</p>
    <p><b>ตำแหน่ง:</b> ${payload.positionApplied || "-"}</p>
  `;

  try {
    const [response] = await sgMail.send({
      to: HR_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `Resume: ${subjectName} (${subjectPosition})`,
      html,
      attachments: [
        {
          content: resumeFile.buffer.toString("base64"),
          filename: safeResumeName,
          type: resumeFile.mimetype,
          disposition: "attachment",
        },
      ],
    });

    console.log("SendGrid status:", response?.statusCode);
    return { ok: true, skipped: false };
  } catch (error) {
    console.error("SendGrid error:", error);
    return { ok: false, skipped: false, error: error.message || "SendGrid failed" };
  }
}

function decodeOriginalName(filename) {
  if (!filename || typeof filename !== "string") return "";
  const hasThai = /[\u0E00-\u0E7F]/.test(filename);
  const hasMojibake = /Ã|Â|â|à/.test(filename);
  if (!hasThai && hasMojibake) {
    try {
      return Buffer.from(filename, "latin1").toString("utf8");
    } catch (error) {
      return filename;
    }
  }
  return filename;
}

function sanitizeFilename(filename) {
  if (!filename || typeof filename !== "string") return "cv.pdf";
  const decoded = decodeOriginalName(filename);
  const baseName = path.basename(decoded);
  const cleaned = baseName.replace(/[\0<>:"/\\|?*\x00-\x1F]/g, "_").trim();
  const ensuredPdf = /\.pdf$/i.test(cleaned) ? cleaned : `${cleaned || "cv"}.pdf`;
  return ensuredPdf || "cv.pdf";
}

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/", (req, res) => res.status(200).send("OK"));

app.post("/api/line/webhook", (req, res) => {
  const verification = verifyLineSignature(req);
  if (!verification.ok) {
    console.warn("[line][webhook] signature verification failed:", verification.error);
    return res.status(verification.status || 401).json({ ok: false, error: verification.error });
  }

  const events = req.body?.events;
  if (!Array.isArray(events)) {
    return res.json({ ok: true });
  }

  const seen = new Set();
  events.forEach((event) => {
    const userId = event?.source?.userId;
    if (typeof userId !== "string" || !userId.trim()) return;
    const normalized = userId.trim();
    if (seen.has(normalized)) return;
    seen.add(normalized);
    console.log("[line][webhook] userId:", normalized, "event:", event?.type || "-");
  });

  if (verification.skipped) {
    console.warn("[line][webhook] LINE_CHANNEL_SECRET not set; signature verification skipped.");
  }

  return res.json({ ok: true });
});

app.post("/api/notify/line/job-application", async (req, res) => {
  const body = req.body || {};
  const fields = {
    fullName: typeof body.fullName === "string" ? body.fullName.trim() : "",
    positionApplied: typeof body.positionApplied === "string" ? body.positionApplied.trim() : "",
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    email: typeof body.email === "string" ? body.email.trim() : "",
    clientTime: typeof body.clientTime === "string" ? body.clientTime.trim() : "",
    adminUrl: typeof body.adminUrl === "string" ? body.adminUrl.trim() : "",
  };

  const text = buildLineJobApplicationText(fields);
  const result = await sendLineMessage({
    messages: [
      {
        type: "text",
        text,
      },
    ],
  });

  if (!result.ok && !result.skipped) {
    console.warn("[line] Notification failed (non-blocking):", result);
  }

  return res.json(result);
});

app.post("/api/line/notify", async (req, res) => {
  const body = req.body || {};
  const payload = {
    applicantName: typeof body.applicantName === "string" ? body.applicantName.trim() : "",
    emailTo: typeof body.emailTo === "string" ? body.emailTo.trim() : "",
    page: typeof body.page === "string" ? body.page.trim() : "",
    cvFilename: typeof body.cvFilename === "string" ? body.cvFilename.trim() : "",
  };

  const mode = String(process.env.LINE_NOTIFY_MODE || "multicast")
    .trim()
    .toLowerCase();
  if (mode === "broadcast") {
    return res.json({
      ok: false,
      skipped: true,
      error: "LINE_NOTIFY_MODE=broadcast is not supported for /api/line/notify",
    });
  }

  const timestamp = new Date().toISOString();
  const targetEmail = payload.emailTo || HR_EMAIL || "-";
  const lines = [`📩 มีผู้สมัครส่งไฟล์ CV เข้าอีเมล ${targetEmail} แล้วครับ/ค่ะ`];

  if (payload.applicantName) lines.push(`👤 ผู้สมัคร: ${payload.applicantName}`);
  if (payload.cvFilename) lines.push(`📄 ไฟล์: ${payload.cvFilename}`);
  if (payload.page) lines.push(`🧾 หน้า: ${payload.page}`);

  lines.push(`⏰ เวลา: ${formatBangkokDateTimeThai(timestamp)}`);
  lines.push("👉 รบกวนเข้าไปตรวจสอบอีเมลด้วยนะครับ");

  const text = lines.join("\n");
  const result = await sendLineMessage({
    messages: [
      {
        type: "text",
        text,
      },
    ],
  });

  if (result.ok) {
    if (Array.isArray(result.results)) {
      console.log("[line] CV notify push results:", result.results);
    } else {
      console.log("[line] CV notify status:", result.status, result.body || "");
    }
  } else if (!result.skipped) {
    console.warn("[line] CV notify failed (non-blocking):", result);
  }

  return res.json(result);
});

app.post("/api/apply/cv", (req, res) => {
  cvUpload.single("cv")(req, res, async (err) => {
    if (err) {
      const isSizeError = err.code === "LIMIT_FILE_SIZE";
      console.error("[cv] upload error:", err);
      return res.status(isSizeError ? 413 : 400).json({
        ok: false,
        error: isSizeError ? "File too large" : "Upload failed",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ ok: false, error: "Missing CV file" });
    }

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ ok: false, error: "CV must be a PDF" });
    }

    const safeFilename = sanitizeFilename(file.originalname);
    const position = req.body?.position || "เภสัชกร";
    const source = req.body?.source || "quick_cv";

    console.log(
      `[cv] received: ${safeFilename} (${file.mimetype}, ${file.size} bytes)`
    );
    console.log("[cv] validated:", safeFilename);

    if (!SENDGRID_API_KEY || !HR_EMAIL || !process.env.FROM_EMAIL) {
      return res.status(500).json({ ok: false, error: "Missing SendGrid configuration" });
    }

    const timestamp = new Date().toISOString();
    const sizeKb = (file.size / 1024).toFixed(1);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

    const subject = "RxHR | เภสัชกรสนใจสมัครงาน | Quick CV";
    const text = [
      "Quick CV submission",
      `Timestamp: ${timestamp}`,
      `Position: ${position}`,
      `Source: ${source}`,
      `Filename: ${safeFilename}`,
      `Filesize: ${file.size} bytes (${sizeKb} KB / ${sizeMb} MB)`,
    ].join("\n");

    const html = `
      <h2>Quick CV submission</h2>
      <p><b>Timestamp:</b> ${timestamp}</p>
      <p><b>Position:</b> ${position}</p>
      <p><b>Source:</b> ${source}</p>
      <p><b>Filename:</b> ${safeFilename}</p>
      <p><b>Filesize:</b> ${file.size} bytes (${sizeKb} KB / ${sizeMb} MB)</p>
    `;

    try {
      const [response] = await sgMail.send({
        to: HR_EMAIL,
        from: process.env.FROM_EMAIL,
        subject,
        text,
        html,
        attachments: [
          {
            content: file.buffer.toString("base64"),
            filename: safeFilename,
            type: file.mimetype,
            disposition: "attachment",
          },
        ],
      });

      console.log("[cv] sendgrid status:", response?.statusCode);
      const responseBody = { ok: true, message: "sent" };

      return res.json(responseBody);
    } catch (sendError) {
      console.error("[cv] sendgrid error:", sendError);
      return res.status(502).json({
        ok: false,
        error: sendError.message || "SendGrid failed",
      });
    }
  });
});

app.post("/api/submit-application", upload.single("resume"), async (req, res) => {
  let payload;

  try {
    payload = JSON.parse(req.body?.payload || "{}");
  } catch (error) {
    return res.status(400).json({ ok: false, error: "Invalid payload JSON" });
  }

  console.log("Payload keys:", Object.keys(payload));

  if (req.file) {
    console.log("Resume:", req.file.originalname, req.file.mimetype, `${req.file.size} bytes`);
  } else {
    console.log("Resume: none");
  }

  const gasResult = await forwardToAppsScript(payload);
  const resumeResult = await sendResumeEmail(payload, req.file || null);

  const ok = gasResult.ok && (resumeResult.ok || resumeResult.skipped);
  const statusCode = gasResult.ok ? 200 : 502;

  return res.status(statusCode).json({
    ok,
    gasOk: gasResult.ok,
    gasStatus: gasResult.status,
    gasBody: gasResult.body,
    resumeOk: resumeResult.ok,
    resumeSkipped: resumeResult.skipped,
    resumeError: resumeResult.error || null,
  });
});

app.post("/api/resume", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      positionApplied,
      resumeFileName,
      resumeFileMime,
      resumeFileDataBase64,
    } = req.body || {};

    if (!SENDGRID_API_KEY) {
      return res.status(500).json({ ok: false, error: "Missing REACTNJOB_SENDGRID_API_KEY" });
    }

    if (!HR_EMAIL || !process.env.FROM_EMAIL) {
      return res.status(500).json({ ok: false, error: "Missing HR_EMAIL or FROM_EMAIL" });
    }

    const base64 = stripDataUrl(resumeFileDataBase64);
    if (!resumeFileName || !resumeFileMime || !base64) {
      return res.status(400).json({ ok: false, error: "Missing resume attachment data" });
    }

    const subjectName = fullName || "Unknown";
    const subjectPosition = positionApplied || "Unknown position";

    const html = `
      <h2>Resume upload</h2>
      <p><b>ชื่อ:</b> ${fullName || "-"}</p>
      <p><b>อีเมล:</b> ${email || "-"}</p>
      <p><b>โทร:</b> ${phone || "-"}</p>
      <p><b>ตำแหน่ง:</b> ${positionApplied || "-"}</p>
    `;

    await sgMail.send({
      to: HR_EMAIL,
      from: process.env.FROM_EMAIL,
      subject: `Resume: ${subjectName} (${subjectPosition})`,
      html,
      attachments: [
        {
          content: base64,
          filename: resumeFileName,
          type: resumeFileMime,
          disposition: "attachment",
        },
      ],
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("RESUME UPLOAD ERROR:", error);
    return res.status(500).json({ ok: false, error: error.message || "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

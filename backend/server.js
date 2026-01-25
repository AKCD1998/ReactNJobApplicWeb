const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const sgMail = require("@sendgrid/mail");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;
const SUBMIT_URL = process.env.SUBMIT_URL;
const QUICK_CV_SUBMIT_URL = process.env.QUICK_CV_SUBMIT_URL || SUBMIT_URL;
const HR_EMAIL = process.env.HR_EMAIL || process.env.HR_TO_EMAIL;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

const CV_FILE_LIMIT = 10 * 1024 * 1024;
const cvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CV_FILE_LIMIT },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "15mb" }));

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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

  if (!process.env.SENDGRID_API_KEY || !HR_EMAIL || !process.env.FROM_EMAIL) {
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

    if (!process.env.SENDGRID_API_KEY || !HR_EMAIL || !process.env.FROM_EMAIL) {
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
      let gasWarning = null;
      let gasPayload = null;
      let gasMeta = null;

      try {
        gasPayload = {
          type: "quick_cv",
          submittedAt: timestamp,
          positionApplied: position || "เภสัชกร",
          resumeFileName: safeFilename,
          resumeBase64: file.buffer.toString("base64"),
          email: req.body?.email || "",
          fullName: req.body?.fullName || "",
          phone: req.body?.phone || "",
        };

        const gasResult = await forwardQuickCvToAppsScript(gasPayload);
        if (!gasResult.ok) {
          gasWarning = "quick_cv_forward_failed";
        } else if (gasResult.json) {
          gasMeta = gasResult.json;
        }
      } catch (gasError) {
        gasWarning = "quick_cv_forward_failed";
        console.error("[cv] GAS forward error:", gasError);
      }

      const responseBody = { ok: true, message: "sent" };
      if (gasWarning) responseBody.warning = gasWarning;
      if (gasMeta?.fileUrl) responseBody.fileUrl = gasMeta.fileUrl;
      if (gasMeta?.fileId) responseBody.fileId = gasMeta.fileId;

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

    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({ ok: false, error: "Missing SENDGRID_API_KEY" });
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

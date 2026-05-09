const { spawn } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
const { after, test } = require("node:test");
const assert = require("node:assert/strict");

const backendRoot = path.resolve(__dirname, "..");
const serverEntry = path.join(backendRoot, "server.js");
const children = new Set();

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

function testEnv(extra = {}) {
  return {
    ...process.env,
    NODE_ENV: "test",
    PORT: "",
    SUBMIT_URL: "",
    QUICK_CV_SUBMIT_URL: "",
    HR_EMAIL: "",
    HR_TO_EMAIL: "",
    LINE_NOTIFY_ADMIN_URL: "",
    CORS_ORIGINS: "http://localhost:5173",
    REACTNJOB_SENDGRID_API_KEY: "",
    FROM_EMAIL: "",
    LINE_CHANNEL_SECRET: "",
    LINE_CHANNEL_ACCESS_TOKEN: "",
    LINE_NOTIFY_MODE: "",
    LINE_NOTIFY_USER_IDS: "",
    ...extra,
  };
}

function waitForServer(child, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let output = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`Timed out waiting for backend startup. Output:\n${output}`));
    }, timeoutMs);

    function finish(error) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(output);
    }

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.includes("Server listening on port")) finish();
    });

    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.on("error", finish);
    child.on("exit", (code) => {
      if (!settled) finish(new Error(`Backend exited early with code ${code}. Output:\n${output}`));
    });
  });
}

function stopServer(child) {
  return new Promise((resolve) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) {
      resolve();
      return;
    }

    const fallback = setTimeout(resolve, 3000);
    child.once("exit", () => {
      clearTimeout(fallback);
      resolve();
    });
    child.kill();
  });
}

async function withServer(extraEnv, fn) {
  const port = await getFreePort();
  const child = spawn(process.execPath, [serverEntry], {
    cwd: backendRoot,
    env: testEnv({ ...extraEnv, PORT: String(port) }),
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.add(child);

  try {
    await waitForServer(child);
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await stopServer(child);
    children.delete(child);
  }
}

async function readJson(response) {
  return response.json().catch(() => null);
}

after(async () => {
  await Promise.all(Array.from(children, stopServer));
});

test("root and health routes return the current baseline responses", async () => {
  await withServer({}, async (baseUrl) => {
    const root = await fetch(`${baseUrl}/`);
    assert.equal(root.status, 200);
    assert.equal(await root.text(), "OK");

    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await readJson(health), { ok: true });
  });
});

test("LINE webhook accepts empty events when signature secret is not configured", async () => {
  await withServer({}, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/line/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: [] }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await readJson(response), { ok: true });
  });
});

test("LINE webhook rejects unsigned requests when signature secret is configured", async () => {
  await withServer({ LINE_CHANNEL_SECRET: "test-only-secret" }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/line/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: [] }),
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await readJson(response), {
      ok: false,
      error: "Missing x-line-signature header",
    });
  });
});

test("LINE notification routes fail safely without external credentials", async () => {
  await withServer({}, async (baseUrl) => {
    const jobNotify = await fetch(`${baseUrl}/api/notify/line/job-application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Test Applicant", positionApplied: "Test Role" }),
    });
    assert.equal(jobNotify.status, 200);
    assert.deepEqual(await readJson(jobNotify), {
      ok: false,
      skipped: true,
      error: "Missing LINE_CHANNEL_ACCESS_TOKEN",
    });

    const cvNotify = await fetch(`${baseUrl}/api/line/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicantName: "Test Applicant" }),
    });
    assert.equal(cvNotify.status, 200);
    assert.deepEqual(await readJson(cvNotify), {
      ok: false,
      skipped: true,
      error: "Missing LINE_CHANNEL_ACCESS_TOKEN",
    });
  });
});

test("CV upload route validates missing and non-PDF files before email delivery", async () => {
  await withServer({}, async (baseUrl) => {
    const missing = await fetch(`${baseUrl}/api/apply/cv`, {
      method: "POST",
      body: new FormData(),
    });
    assert.equal(missing.status, 400);
    assert.deepEqual(await readJson(missing), { ok: false, error: "Missing CV file" });

    const form = new FormData();
    form.append("cv", new Blob(["not a pdf"], { type: "text/plain" }), "resume.txt");
    const wrongType = await fetch(`${baseUrl}/api/apply/cv`, {
      method: "POST",
      body: form,
    });
    assert.equal(wrongType.status, 400);
    assert.deepEqual(await readJson(wrongType), { ok: false, error: "CV must be a PDF" });
  });
});

test("application and resume routes keep baseline validation behavior", async () => {
  await withServer({}, async (baseUrl) => {
    const form = new FormData();
    form.append("payload", "{");
    const invalidPayload = await fetch(`${baseUrl}/api/submit-application`, {
      method: "POST",
      body: form,
    });
    assert.equal(invalidPayload.status, 400);
    assert.deepEqual(await readJson(invalidPayload), {
      ok: false,
      error: "Invalid payload JSON",
    });

    const resume = await fetch(`${baseUrl}/api/resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(resume.status, 500);
    assert.deepEqual(await readJson(resume), {
      ok: false,
      error: "Missing REACTNJOB_SENDGRID_API_KEY",
    });
  });
});

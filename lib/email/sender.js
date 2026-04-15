import nodemailer from 'nodemailer';

/**
 * Lazy-initialized SMTP transporter. Reads from env vars at first
 * use so the app can boot without SMTP creds (useful during dev).
 */
let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT) {
    // Fallback: log to console instead of sending. Prevents dev crashes.
    cachedTransporter = {
      sendMail: async (opts) => {
        console.warn('[email] SMTP not configured — message not sent:');
        console.warn('       to:', opts.to);
        console.warn('  subject:', opts.subject);
        return { messageId: 'stub-' + Date.now(), accepted: [opts.to] };
      },
    };
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth:
      SMTP_USER && SMTP_PASS
        ? { user: SMTP_USER, pass: SMTP_PASS }
        : undefined,
  });

  return cachedTransporter;
}

/**
 * Send a transactional email.
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text]
 */
export async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  const from = `"${process.env.SMTP_FROM_NAME || 'UMICO'}" <${
    process.env.SMTP_FROM_EMAIL || 'no-reply@umico.local'
  }>`;

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: text || stripHtml(html || ''),
  });
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

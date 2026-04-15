/**
 * Email templates — inline HTML, UMICO-branded.
 * Kept intentionally simple (table-based) for maximum email-client support.
 */

const BRAND = {
  name: process.env.SITE_NAME || 'UMICO',
  url: process.env.SITE_URL || 'http://localhost:3000',
};

function wrap(inner) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#FAF6F1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2A1810;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAF6F1;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;background:#FFFFFF;border:1px solid rgba(42,24,16,0.12);">
            <tr>
              <td style="padding:32px 40px;border-bottom:1px solid rgba(42,24,16,0.08);">
                <div style="font-family:Georgia,serif;font-size:22px;letter-spacing:0.18em;color:#3B2418;">${BRAND.name}</div>
              </td>
            </tr>
            <tr><td style="padding:40px;">${inner}</td></tr>
            <tr>
              <td style="padding:24px 40px;border-top:1px solid rgba(42,24,16,0.08);font-size:12px;color:rgba(42,24,16,0.56);">
                <div>&copy; ${new Date().getFullYear()} ${BRAND.name}</div>
                <div style="margin-top:4px;"><a href="${BRAND.url}" style="color:#BA9371;text-decoration:none;">${BRAND.url}</a></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function otpEmail({ code, purpose }) {
  const label =
    purpose === 'register'
      ? 'Verify your email'
      : purpose === 'reset_password'
      ? 'Password reset'
      : 'Your verification code';

  return {
    subject: `${label} — ${BRAND.name}`,
    html: wrap(`
      <h2 style="font-family:Georgia,serif;font-weight:500;font-size:26px;margin:0 0 16px 0;color:#2A1810;">${label}</h2>
      <p style="margin:0 0 24px 0;line-height:1.7;color:rgba(42,24,16,0.72);">Use the code below to continue. It expires in 5 minutes.</p>
      <div style="font-family:Georgia,serif;font-size:36px;letter-spacing:0.5em;color:#3B2418;padding:20px 0;text-align:center;background:#FAF6F1;">${code}</div>
      <p style="margin:24px 0 0 0;font-size:13px;color:rgba(42,24,16,0.56);">If you didn't request this, you can safely ignore this email.</p>
    `),
  };
}

export function welcomeEmail({ name }) {
  return {
    subject: `Welcome to ${BRAND.name}`,
    html: wrap(`
      <h2 style="font-family:Georgia,serif;font-weight:500;font-size:26px;margin:0 0 16px 0;color:#2A1810;">Welcome, ${escapeHtml(
        name
      )}.</h2>
      <p style="margin:0 0 16px 0;line-height:1.7;color:rgba(42,24,16,0.72);">Your account is ready. Thank you for joining ${BRAND.name}.</p>
    `),
  };
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

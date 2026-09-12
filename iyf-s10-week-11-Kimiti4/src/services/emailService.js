/**
 * R2 [P1-12] Email service abstraction.
 *
 * Behavior by NODE_ENV:
 *   - 'production' : requires SMTP_* env vars. If any are missing or invalid,
 *                    send() resolves with { status: 'failed', reason: ... }
 *                    and DOES NOT raise. The caller decides how to surface this.
 *   - 'development': uses SMTP_* env vars if present; otherwise falls back to
 *                    an Ethereal test account (so devs without SMTP can still
 *                    exercise the flow locally).
 *   - 'test'       : NOOP transport. send() returns
 *                    { status: 'noop', reason: 'test environment' } without
 *                    touching the network. This makes the contract testable
 *                    and prevents the controller from ever claiming a real
 *                    email was sent during tests.
 *
 * Production never falls back to Ethereal; production never silently "succeeds"
 * when configuration is missing.
 */

const nodemailer = require('nodemailer');

const ENV = process.env.NODE_ENV || 'development';

function smtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_PORT
    && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);
}

let _cachedTransport = null;
let _cachedFrom = null;

async function getTransport() {
  if (ENV === 'test') {
    return null; // NOOP
  }
  if (_cachedTransport) return _cachedTransport;
  if (ENV === 'production') {
    if (!smtpConfigured()) {
      // Fail closed: do NOT construct a transport, do NOT fall back.
      const e = new Error('SMTP configuration missing in production');
      e.code = 'SMTP_NOT_CONFIGURED';
      throw e;
    }
    _cachedTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    _cachedFrom = process.env.SMTP_FROM;
  } else {
    // development
    if (smtpConfigured()) {
      _cachedTransport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: parseInt(process.env.SMTP_PORT, 10) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      _cachedFrom = process.env.SMTP_FROM;
    } else {
      // Ethereal fallback (dev-only)
      const testAccount = await nodemailer.createTestAccount();
      _cachedTransport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      _cachedFrom = process.env.SMTP_FROM || '"JamiiLink Security" <security@jamiilink.com>';
    }
  }
  return _cachedTransport;
}

/**
 * Send a single email. Never throws. Returns a structured delivery status.
 *
 * status: 'delivered' | 'noop' | 'failed'
 * reason: human-readable detail
 * messageId: provider message id (if available)
 * previewUrl: Ethereal preview url (dev only, if available)
 */
async function send({ to, subject, text, html }) {
  if (ENV === 'test') {
    return { status: 'noop', reason: 'test environment', to, subject };
  }
  let transport;
  try {
    transport = await getTransport();
  } catch (err) {
    return { status: 'failed', reason: err.message, code: err.code || null, to, subject };
  }
  try {
    const info = await transport.sendMail({
      from: _cachedFrom,
      to,
      subject,
      text,
      html
    });
    const result = {
      status: 'delivered',
      to,
      subject,
      messageId: info.messageId || null
    };
    if (ENV === 'development' && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) result.previewUrl = previewUrl;
    }
    return result;
  } catch (err) {
    return { status: 'failed', reason: err.message, code: err.code || null, to, subject };
  }
}

module.exports = { send, _internal: { smtpConfigured, ENV } };

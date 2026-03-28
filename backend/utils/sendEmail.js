const nodemailer = require('nodemailer');

/**
 * Resolve "from" header: prefers EMAIL_FROM from .env.example format
 * (e.g. `House Rental <noreply@example.com>`) or falls back to EMAIL_USER.
 */
function resolveFromAddress() {
  const fromEnv = process.env.EMAIL_FROM && String(process.env.EMAIL_FROM).trim();
  if (fromEnv) return fromEnv;
  if (process.env.EMAIL_USER) return process.env.EMAIL_USER;
  return undefined;
}

const sendEmail = async (options) => {
  const from = resolveFromAddress();
  if (!from) {
    throw new Error('EMAIL_FROM or EMAIL_USER must be set to send email');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;

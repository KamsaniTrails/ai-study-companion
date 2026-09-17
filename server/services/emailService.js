const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    // In-memory store: email.toLowerCase() -> { otp, expiresAt, attempts, createdAt }
    this.otpStore = new Map();
    // Cleanup expired OTPs every 5 minutes
    setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [email, record] of this.otpStore.entries()) {
      if (now > record.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }

  generateOtp(length = 6) {
    // Generate secure 6-digit numeric OTP
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length);
    return crypto.randomInt(min, max).toString();
  }

  saveOtp(email, otp) {
    const normalizedEmail = email.trim().toLowerCase();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity
    this.otpStore.set(normalizedEmail, {
      otp,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    });
  }

  verifyOtp(email, enteredCode) {
    const normalizedEmail = email.trim().toLowerCase();
    const record = this.otpStore.get(normalizedEmail);

    if (!record) {
      return {
        valid: false,
        error: 'No verification code was requested for this email, or it has expired. Please request a new code.'
      };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(normalizedEmail);
      return {
        valid: false,
        error: 'This verification code has expired. Please request a new code.'
      };
    }

    record.attempts += 1;

    if (record.attempts > 5) {
      this.otpStore.delete(normalizedEmail);
      return {
        valid: false,
        error: 'Too many incorrect attempts. For security, please request a new verification code.'
      };
    }

    const cleanEntered = (enteredCode || '').trim();
    if (record.otp !== cleanEntered) {
      const remaining = 5 - record.attempts;
      return {
        valid: false,
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
      };
    }

    // Success: consume OTP so it cannot be re-used
    this.otpStore.delete(normalizedEmail);
    return { valid: true };
  }

  getTransporter() {
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;

    if (smtpHost && emailUser && emailPass) {
      return nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }

    if (emailUser && emailPass) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }

    return null;
  }

  async sendOtpEmail(email, otp, recipientName = 'Learner') {
    const normalizedEmail = email.trim().toLowerCase();
    const transporter = this.getTransporter();

    if (!transporter) {
      console.warn(
        `[EmailService] ⚠️ SMTP credentials not configured (EMAIL_USER / EMAIL_PASS). ` +
        `OTP for ${normalizedEmail} is [${otp}] (expires in 10 mins). Configure EMAIL_USER and EMAIL_PASS to deliver to inbox.`
      );
      return {
        sent: false,
        reason: 'SMTP_NOT_CONFIGURED',
        message: 'Email service credentials not configured on the server yet.'
      };
    }

    const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.GMAIL_USER;

    const mailOptions = {
      from: `"AI Study Companion" <${senderEmail}>`,
      to: normalizedEmail,
      subject: `Your Verification Code: ${otp} — AI Study Companion`,
      text: `Hello ${recipientName},\n\nYour one-time verification code for AI Study Companion is: ${otp}\n\nThis code will expire in 10 minutes. Please do not share it with anyone.\n\nBest regards,\nAI Study Companion Academic Platform`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px; color: #1e293b; }
            .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #0284c7 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
            .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
            .content { padding: 32px 28px; }
            .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
            .text { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; }
            .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #4f46e5; margin: 0; font-family: monospace; }
            .otp-sub { font-size: 12px; color: #64748b; margin-top: 8px; }
            .footer { border-top: 1px solid #f1f5f9; padding: 20px 28px; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; }
            .badge { display: inline-block; padding: 4px 10px; background: #fee2e2; color: #ef4444; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>AI Study Companion</h1>
              <p>Secure Student & Academic Workspace</p>
            </div>
            <div class="content">
              <div class="greeting">Hello ${recipientName},</div>
              <p class="text">
                You have requested a secure one-time verification code to log in to your <strong>AI Study Companion</strong> workspace.
              </p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <div class="otp-sub">Valid for <strong>10 minutes</strong> &bull; Single-use only</div>
              </div>
              <p class="text" style="font-size: 13px; color: #64748b;">
                ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. Platform faculty or administrators will never ask for your verification code. If you did not make this request, please disregard this email.
              </p>
            </div>
            <div class="footer">
              AI Study Companion &bull; Evidence-Grounded Learning Platform<br/>
              Automated message, please do not reply directly.
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] ✅ Verification code successfully sent to ${normalizedEmail}. MessageId: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService] ❌ Failed to send email to ${normalizedEmail}:`, err.message);
      return { sent: false, error: err.message };
    }
  }
}

const emailService = new EmailService();
module.exports = { emailService, EmailService };

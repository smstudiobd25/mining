import nodemailer from 'nodemailer';

const FROM_EMAIL = '"Nexora Network" <' + (process.env.GMAIL_USER || 'noreply@gmail.com') + '>';

interface SendOTPEmailParams {
  to: string;
  otp: string;
  name?: string;
}

// Create reusable transporter
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendOTPEmail({ to, otp, name }: SendOTPEmailParams): Promise<{ success: boolean; error?: string }> {
  // If Gmail credentials not set, log to console
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('[Email] Gmail not configured. OTP for', to, ':', otp);
    return { success: true };
  }

  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Your Nexora Network Verification Code',
      html: `
        <div style="max-width:480px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0e1a;border:1px solid rgba(59,130,246,0.15);border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#3B82F6,#8B5CF6);padding:28px 24px;text-align:center">
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.5px">Nexora Network</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px">Mine Activity. Earn Rewards. Grow Together.</p>
          </div>
          <div style="padding:32px 24px">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:14px">Hello${name ? ` ${name}` : ''},</p>
            <p style="margin:0 0 24px;color:#64748b;font-size:13px;line-height:1.6">
              Your verification code for Nexora Network is below. This code will expire in <strong style="color:#60a5fa">5 minutes</strong>.
            </p>
            <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:12px;padding:20px;text-align:center;margin:0 0 24px">
              <p style="margin:0 0 6px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:2px">Verification Code</p>
              <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:8px;color:#60a5fa;font-family:'Courier New',monospace">${otp}</p>
            </div>
            <p style="margin:0 0 16px;color:#475569;font-size:12px;line-height:1.6">
              Enter this code in the app to verify your account. If you did not request this code, you can safely ignore this email.
            </p>
            <div style="background:rgba(234,179,8,0.06);border:1px solid rgba(234,179,8,0.12);border-radius:8px;padding:12px 16px">
              <p style="margin:0;color:#ca8a04;font-size:11px;line-height:1.5">
                <strong>Security Notice:</strong> Never share this code with anyone. Nexora Network will never ask for your verification code.
              </p>
            </div>
          </div>
          <div style="border-top:1px solid rgba(59,130,246,0.08);padding:16px 24px;text-align:center">
            <p style="margin:0;color:#334155;font-size:11px">&copy; ${new Date().getFullYear()} Nexora Network. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log('[Email] OTP sent to:', to, 'MessageID:', info.messageId);
    return { success: true };
  } catch (err: any) {
    console.error('[Email] Send error:', err.message);
    return { success: false, error: err.message || 'Email send failed' };
  }
}

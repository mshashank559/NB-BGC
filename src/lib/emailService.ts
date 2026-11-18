import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

export interface PaymentReminderPayload {
  candidateName: string;
  recipientEmail: string;
  installmentNumber: number;
  totalInstallments?: number;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paymentLink: string;
  candidateId?: string;
  installmentId?: string;
  triggeredBy?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  previewUrl?: string | false;
}

/**
 * Creates and verifies the Gmail SMTP Transporter using NetBounce's App Password
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false';
  const user = process.env.SMTP_USER || 'enroll@netbounceplacement.com';
  const rawPass = process.env.SMTP_PASS || 'xovtrvtnlipwmgij';
  const pass = rawPass.replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Generates the responsive, high-contrast NetBounce branded HTML email
 */
export function generateReminderEmailHtml(payload: PaymentReminderPayload): string {
  const {
    candidateName,
    installmentNumber,
    totalInstallments = 4,
    amount,
    dueDate,
    paymentLink,
  } = payload;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  // Parse due date for human readable display
  const dateObj = new Date(dueDate + 'T00:00:00');
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  const humanDueDate = isNaN(dateObj.getTime())
    ? dueDate
    : dateObj.toLocaleDateString('en-US', dateOptions);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder - NetBounce Placement LLC</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F1F5F9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner (Crisp White Background with subtle blue accent for maximum logo clarity) -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 28px 36px; border-bottom: 3px solid #2563EB; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <img src="cid:netbounce-logo@netbounceplacement.com" alt="NetBounce Placement LLC" style="height: 48px; max-height: 48px; width: auto; display: block; border: 0;" />
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: #EFF6FF; color: #1D4ED8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 6px 12px; border-radius: 9999px; border: 1px solid #BFDBFE;">
                      Official Notice
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Headline Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%); padding: 24px 36px; color: #FFFFFF;">
              <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: #FFFFFF;">
                Payment Installment Reminder
              </h1>
              <p style="margin: 0; font-size: 13px; color: #DBEAFE; font-weight: 400;">
                Candidate Compliance & Placement Fee Schedule
              </p>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
                Dear <strong style="color: #0F172A;">${candidateName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #475569;">
                This is a friendly reminder from <strong>NetBounce Placement LLC</strong> regarding your upcoming placement fee installment. Please review the payment summary below to keep your onboarding agreement and compliance records in good standing.
              </p>

              <!-- Payment Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #E2E8F0; background-color: #F1F5F9;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="left">
                          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B;">Amount Due</span>
                          <div style="font-size: 28px; font-weight: 800; color: #0F172A; margin-top: 4px; letter-spacing: -0.03em;">
                            ${formattedAmount} <span style="font-size: 14px; font-weight: 600; color: #64748B;">USD</span>
                          </div>
                        </td>
                        <td align="right" style="vertical-align: middle;">
                          <span style="display: inline-block; background-color: #FEF3C7; color: #92400E; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 8px; border: 1px solid #FDE68A;">
                            Due Soon
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="50%" style="padding-bottom: 12px;">
                          <span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 600; display: block;">Installment</span>
                          <strong style="font-size: 14px; color: #1E293B;">Installment #${installmentNumber} of ${totalInstallments}</strong>
                        </td>
                        <td width="50%" style="padding-bottom: 12px;">
                          <span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 600; display: block;">Scheduled Due Date</span>
                          <strong style="font-size: 14px; color: #DC2626;">${humanDueDate} (EST)</strong>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 10px; border-top: 1px dashed #E2E8F0;">
                          <span style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 600; display: block;">Account Associated</span>
                          <span style="font-size: 13px; color: #475569; font-family: monospace;">${payload.recipientEmail}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${paymentLink}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #FFFFFF; text-align: center; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                      Complete Payment (${formattedAmount}) &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct URL -->
              <div style="background-color: #F8FAFC; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; border: 1px solid #E2E8F0;">
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748B; font-weight: 600;">
                  If the button above does not work, copy and paste this link into your browser:
                </p>
                <a href="${paymentLink}" target="_blank" style="font-size: 12px; color: #2563EB; word-break: break-all; text-decoration: underline;">
                  ${paymentLink}
                </a>
              </div>

              <!-- Assistance Note -->
              <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748B;">
                If you have already processed this payment or scheduled a wire transfer, please reply to this email with your transfer confirmation receipt or transaction ID.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 24px 36px; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #334155;">
                NetBounce Placement LLC
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748B; line-height: 16px;">
                Accounts & Candidate Compliance Department<br>
                Email: <a href="mailto:enroll@netbounceplacement.com" style="color: #2563EB; text-decoration: none;">enroll@netbounceplacement.com</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #94A3B8; line-height: 14px;">
                This is a confidential payment notice intended exclusively for ${candidateName} (${payload.recipientEmail}). Unauthorized interception or disclosure is prohibited.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends the payment reminder email via Gmail SMTP
 */
export async function sendPaymentReminderEmail(
  payload: PaymentReminderPayload
): Promise<SendEmailResult> {
  try {
    const transporter = getMailTransporter();

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(payload.amount);

    const subject = `Payment Reminder: Installment #${payload.installmentNumber} Due on ${payload.dueDate} (EST) — ${payload.candidateName}`;
    const htmlContent = generateReminderEmailHtml(payload);

    // Locate the logo image on disk
    const logoPath = path.join(process.cwd(), 'public', 'netbounce-logo.png');
    const attachments = [];

    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'netbounce-logo.png',
        path: logoPath,
        cid: 'netbounce-logo@netbounceplacement.com',
      });
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'NetBounce Placement LLC'}" <${process.env.SMTP_USER || 'enroll@netbounceplacement.com'}>`,
      to: payload.recipientEmail,
      replyTo: process.env.SMTP_USER || 'enroll@netbounceplacement.com',
      subject,
      html: htmlContent,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Mail dispatched successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[EmailService] SMTP Dispatch Failed:', err);
    return {
      success: false,
      error: err.message || 'Unknown SMTP error during dispatch',
    };
  }
}


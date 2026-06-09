import { Resend } from 'resend';

// NOTE: For HIPAA production, replace Resend with AWS SES under your AWS BAA.
// Resend is used here for development velocity. Configure a verified sending
// domain at resend.com/domains before sending to real patients.
const resend = new Resend(process.env.RESEND_API_KEY);

export type ReferralEmailData = {
  accessToken: string;
  patientFirst: string;
  patientLast: string;
  patientDob: string;
  treatment: string;
  priority: string;
  notes: string | null;
  fromPracticeName: string;
  fromPracticeCity: string | null;
  fromPracticeState: string | null;
  fromPracticePhone: string | null;
  fromPracticeEmail: string | null;
  fromProviderFirst: string;
  fromProviderLast: string;
  fromProviderSpecialty: string | null;
  toPracticeEmail: string;
  toPracticeName: string;
};

const PRIORITY_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  urgent: { bg: '#fee2e2', color: '#dc2626', label: 'Urgent' },
  high:   { bg: '#fef3c7', color: '#d97706', label: 'High Priority' },
  normal: { bg: '#dbeafe', color: '#2563eb', label: 'Normal' },
  low:    { bg: '#f1f5f9', color: '#64748b', label: 'Low Priority' },
};

function formatDob(dob: string) {
  return new Date(dob + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function buildHtml(data: ReferralEmailData, viewUrl: string): string {
  const badge = PRIORITY_BADGE[data.priority] ?? PRIORITY_BADGE.normal;
  const location = [data.fromPracticeCity, data.fromPracticeState].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>New Dental Referral — DentalRelay</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" role="presentation">

        <!-- Logo -->
        <tr>
          <td style="padding-bottom:20px;">
            <span style="font-size:22px;font-weight:800;color:#0d1b2e;letter-spacing:-0.5px;">Dental<span style="color:#2563eb;">Relay</span></span>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">

            <!-- Blue header -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="background:#2563eb;padding:28px 36px 24px;">
                  <p style="margin:0 0 6px;color:rgba(255,255,255,0.75);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">New Referral</p>
                  <h1 style="margin:0;color:white;font-size:26px;font-weight:700;line-height:1.2;">
                    ${data.patientFirst} ${data.patientLast}
                  </h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${data.treatment}</p>
                </td>
              </tr>
            </table>

            <!-- Body -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="padding:32px 36px;">

                  <!-- Intro -->
                  <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.6;">
                    <strong style="color:#0f172a;">Dr. ${data.fromProviderFirst} ${data.fromProviderLast}</strong>
                    ${data.fromProviderSpecialty ? `(${data.fromProviderSpecialty})` : ''}
                    at <strong style="color:#0f172a;">${data.fromPracticeName}</strong>
                    has sent you a referral${location ? ` from ${location}` : ''}.
                  </p>

                  <!-- Patient + priority row -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
                    <tr>
                      <td style="background:#f8fafc;border-radius:10px;padding:18px 20px;width:60%;">
                        <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Patient</p>
                        <p style="margin:0;font-size:16px;font-weight:700;color:#0f172a;">${data.patientFirst} ${data.patientLast}</p>
                        <p style="margin:4px 0 0;font-size:13px;color:#64748b;">DOB: ${formatDob(data.patientDob)}</p>
                      </td>
                      <td width="16"></td>
                      <td valign="top" style="padding-top:4px;">
                        <span style="display:inline-block;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:700;background:${badge.bg};color:${badge.color};">
                          ${badge.label}
                        </span>
                      </td>
                    </tr>
                  </table>

                  <!-- Treatment -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;">
                    <tr>
                      <td style="border-left:3px solid #2563eb;padding:4px 0 4px 16px;">
                        <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Treatment Requested</p>
                        <p style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${data.treatment}</p>
                      </td>
                    </tr>
                  </table>

                  ${data.notes ? `
                  <!-- Notes -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:28px;">
                    <tr>
                      <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;">
                        <p style="margin:0 0 6px;font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Clinical Notes</p>
                        <p style="margin:0;font-size:14px;color:#78350f;line-height:1.6;white-space:pre-wrap;">${data.notes.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                  <!-- Divider -->
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 28px;" />

                  <!-- CTA -->
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:20px;">
                    <tr>
                      <td align="center">
                        <a href="${viewUrl}"
                          style="display:inline-block;padding:16px 40px;background:#2563eb;color:white;text-decoration:none;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:-0.2px;">
                          View Full Referral →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;text-align:center;font-size:13px;color:#94a3b8;">
                    No account needed — the link above gives you full access to this referral.
                  </p>

                  ${data.fromPracticePhone ? `
                  <p style="margin:20px 0 0;text-align:center;font-size:13px;color:#64748b;">
                    Questions? Call ${data.fromPracticeName} at <strong>${data.fromPracticePhone}</strong>
                  </p>
                  ` : ''}

                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0 0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              Sent via <strong>DentalRelay</strong> · Secure dental referral platform<br />
              If you weren't expecting this, you can safely ignore it.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendReferralNotification(data: ReferralEmailData) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const viewUrl = `${appUrl}/referrals/view/${data.accessToken}`;

  const fromAddress = process.env.RESEND_FROM_ADDRESS ?? 'DentalRelay <onboarding@resend.dev>';

  return resend.emails.send({
    from: fromAddress,
    to: [data.toPracticeEmail],
    ...(data.fromPracticeEmail ? { reply_to: data.fromPracticeEmail } : {}),
    subject: `New Referral: ${data.patientFirst} ${data.patientLast} — ${data.treatment}`,
    html: buildHtml(data, viewUrl),
  });
}

// Transactional email through Resend (https://resend.com). Server-only.
// Env vars:
//   RESEND_API_KEY   - API key from the Resend dashboard
//   EMAIL_FROM       - e.g. "Clyqa <hello@clyqa.com>" (domain must be verified in Resend)
//   EMAIL_REPLY_TO   - where replies go, e.g. "ellabuilds@outlook.com"

const RESEND_URL = 'https://api.resend.com/emails';
const RESEND_BATCH_URL = 'https://api.resend.com/emails/batch';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function config() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error('RESEND_API_KEY or EMAIL_FROM is not set');
  return { apiKey, from, replyTo: process.env.EMAIL_REPLY_TO || undefined };
}

function payload(msg: EmailMessage) {
  const { from, replyTo } = config();
  return {
    from,
    to: [msg.to],
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    ...(replyTo ? { reply_to: replyTo } : {}),
  };
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  const { apiKey } = config();
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload(msg)),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// Resend accepts up to 100 messages per batch call.
export async function sendEmailBatch(messages: EmailMessage[]): Promise<void> {
  const { apiKey } = config();
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100).map(payload);
    const res = await fetch(RESEND_BATCH_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) throw new Error(`Resend batch ${res.status}: ${await res.text()}`);
  }
}

const shell = (body: string) => `<!doctype html><html><body style="margin:0;background:#f6f7f6;font-family:Arial,sans-serif;color:#171c19">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff">
<p style="font-size:20px;font-weight:700;margin:0 0 24px;color:#059669">Clyqa</p>${body}
<p style="font-size:12px;color:#68716c;margin-top:32px">You received this because you joined the Clyqa waitlist. Performance over popularity.</p>
</div></body></html>`;

export function confirmationEmail(name: string): EmailMessage & { to: string } {
  const first = name.split(' ')[0] || 'there';
  return {
    to: '',
    subject: "You're on the Clyqa waitlist",
    text: `Hi ${first},\n\nYou're on the Clyqa waitlist. We'll email you when early access opens.\n\n— Clyqa`,
    html: shell(`<p style="font-size:16px;line-height:1.6">Hi ${first},</p>
<p style="font-size:16px;line-height:1.6">You're on the Clyqa waitlist. We'll email you as soon as early access opens.</p>
<p style="font-size:16px;line-height:1.6">Performance over popularity.<br/>— The Clyqa team</p>`),
  };
}

export function earlyAccessEmail(name: string, signupUrl: string): EmailMessage & { to: string } {
  const first = name.split(' ')[0] || 'there';
  return {
    to: '',
    subject: 'Early access is open',
    text: `Hi ${first},\n\nEarly access to Clyqa is open. Create your account here: ${signupUrl}\n\n— Clyqa`,
    html: shell(`<p style="font-size:16px;line-height:1.6">Hi ${first},</p>
<p style="font-size:16px;line-height:1.6">Early access to Clyqa is open. You were on the list, so you're first in.</p>
<p><a href="${signupUrl}" style="display:inline-block;background:#10b981;color:#052719;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:8px">Create your account</a></p>
<p style="font-size:16px;line-height:1.6">— The Clyqa team</p>`),
  };
}

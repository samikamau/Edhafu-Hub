// Sends a "Password Reset Successful" confirmation email via Resend.
// Called from reset-password.html right after a password update succeeds.
//
// Setup required (see deployment instructions):
//   1. A Resend account with a verified sending domain (edhafu.com)
//   2. RESEND_API_KEY set as a Supabase secret
//   3. Deployed with: supabase functions deploy send-password-changed-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Must be an address on a domain you have verified in Resend.
const FROM_EMAIL = "Edhafu <noreply@edhafu.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set. Run: supabase secrets set RESEND_API_KEY=your_key");
    }

    const { email, name } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const greetingName = name && name.trim() ? name.trim() : email;

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#17202A">
        <div style="font-size:28px;font-weight:800;margin-bottom:24px;letter-spacing:-0.02em">
          <span style="color:#E63946">e</span><span style="color:#123C36">dhafu</span>
        </div>
        <h2 style="margin-bottom:16px">Password Reset Successful</h2>
        <p>Hi ${greetingName},</p>
        <p>Your Edhafu password has been reset successfully.</p>
        <p>If you did not request this change, please reset your password immediately and contact our support team as soon as possible.</p>
        <p>Thank you for choosing Edhafu as your trusted finance partner.</p>
        <p>Best regards,<br>The Edhafu Team</p>
        <p>Reach us anytime at <a href="mailto:support@edhafu.com" style="color:#123C36">support@edhafu.com</a></p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: "Password Reset Successful",
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error("Resend API error: " + errText);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
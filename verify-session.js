const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Sledujeme již odeslané emaily aby se neposlaly 2x při refreshi
const emailsSent = new Set();

module.exports = async (req, res) => {
  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: 'Chybí session_id' });
  }

  try {
    // 1. Ověř platbu u Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(200).json({
        payment_status: session.payment_status,
        customer_email: null,
      });
    }

    // 2. Pošli email — ale jen jednou
    const customerEmail = session.customer_details?.email;
    const customerName  = session.customer_details?.name || 'there';

    if (customerEmail && !emailsSent.has(session_id)) {
      emailsSent.add(session_id);

      await resend.emails.send({
        from: 'VIRAAL <onboarding@resend.dev>',
        to: customerEmail,
        subject: '🎉 Your VIRAAL Blueprint is ready!',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"></head>
          <body style="font-family:Arial,sans-serif;background:#F5F5F5;margin:0;padding:40px 20px;">
            <div style="background:white;max-width:540px;margin:0 auto;padding:48px 40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <div style="font-size:26px;font-weight:900;letter-spacing:-1px;margin-bottom:32px;">VI<span style="color:#FF6B35;">R</span>AAL</div>
              <div style="background:#DCFCE7;color:#16A34A;font-size:13px;font-weight:700;padding:6px 14px;display:inline-block;margin-bottom:24px;">✓ Payment Confirmed</div>
              <h1 style="font-size:24px;font-weight:800;color:#0D0D0D;margin:0 0 12px;">Thank you, ${customerName}!</h1>
              <p style="color:#666;line-height:1.7;margin:0 0 28px;font-size:15px;">Your purchase was successful. Click below to download <strong>The VIRAAL Blueprint</strong>.</p>
              <a href="https://drive.google.com/file/d/1PvIZhjDauGA--_sMpg__sCXFXz0ajaGG/view?usp=sharing" style="display:inline-block;background:#0D0D0D;color:white;text-decoration:none;padding:16px 36px;font-weight:700;font-size:14px;letter-spacing:1.5px;text-transform:uppercase;">Download Your Blueprint</a>
              <hr style="border:none;border-top:1px solid #E8E8E8;margin:32px 0;">
              <table style="width:100%;background:#F5F5F5;padding:16px;font-size:14px;color:#444;border-collapse:collapse;">
                <tr><td style="padding:6px 0;">Product</td><td style="text-align:right;font-weight:700;">The VIRAAL Blueprint</td></tr>
                <tr><td style="padding:6px 0;">Amount</td><td style="text-align:right;font-weight:700;">$49.00</td></tr>
                <tr><td style="padding:6px 0;">Status</td><td style="text-align:right;color:#16A34A;font-weight:700;">✓ Paid</td></tr>
              </table>
              <p style="font-size:13px;color:#999;margin-top:28px;">Questions? <a href="mailto:viraal-shop@protonmail.com" style="color:#FF6B35;">viraal-shop@protonmail.com</a></p>
            </div>
          </body>
          </html>
        `,
      });

      console.log('✅ Email odeslán na: ' + customerEmail);
    }

    return res.status(200).json({
      payment_status: session.payment_status,
      customer_email: customerEmail ?? null,
    });

  } catch (err) {
    console.error('Chyba verify-session:', err.message);
    return res.status(400).json({ error: 'Neplatná session' });
  }
};

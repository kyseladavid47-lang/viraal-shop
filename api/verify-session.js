const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const emailsSent = new Set();

module.exports = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(200).json({
        payment_status: session.payment_status,
        customer_email: null,
      });
    }

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'there';

    if (customerEmail && !emailsSent.has(session_id)) {
      emailsSent.add(session_id);

      await transporter.sendMail({
        from: '"VIRAAL" <' + process.env.GMAIL_USER + '>',
        to: customerEmail,
        subject: '🎉 Your VIRAAL Blueprint is ready!',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;padding:48px 40px;background:white;">
            <div style="font-size:26px;font-weight:900;margin-bottom:32px;">VI<span style="color:#FF6B35;">R</span>AAL</div>
            <div style="background:#DCFCE7;color:#16A34A;font-size:13px;font-weight:700;padding:6px 14px;display:inline-block;margin-bottom:24px;">✓ Payment Confirmed</div>
            <h1 style="font-size:24px;color:#0D0D0D;margin:0 0 12px;">Thank you, ${customerName}!</h1>
            <p style="color:#666;font-size:15px;line-height:1.7;margin:0 0 28px;">
              Your purchase was successful. Click the button below to download <strong>The VIRAAL Blueprint</strong>.
            </p>
            <a href="https://drive.google.com/file/d/1q7rIJ--Enmvvh6Ip3Hp01UxaBmzlmIld/view?usp=sharing"
               style="display:inline-block;background:#0D0D0D;color:white;text-decoration:none;padding:16px 36px;font-weight:700;font-size:14px;letter-spacing:1.5px;text-transform:uppercase;">
              Download Your Blueprint
            </a>
            <hr style="border:none;border-top:1px solid #E8E8E8;margin:32px 0;">
            <table style="width:100%;background:#F5F5F5;padding:16px;font-size:14px;color:#444;border-collapse:collapse;">
              <tr><td style="padding:6px 0;">Product</td><td style="text-align:right;font-weight:700;">The VIRAAL Blueprint</td></tr>
              <tr><td style="padding:6px 0;">Amount</td><td style="text-align:right;font-weight:700;">$49.00</td></tr>
              <tr><td style="padding:6px 0;">Status</td><td style="text-align:right;color:#16A34A;font-weight:700;">✓ Paid</td></tr>
            </table>
            <p style="font-size:13px;color:#999;margin-top:28px;">
              Questions? <a href="mailto:viraal-shop@protonmail.com" style="color:#FF6B35;">viraal-shop@protonmail.com</a>
            </p>
          </div>
        `,
      });

      console.log('✅ Email sent to: ' + customerEmail);
    }

    return res.status(200).json({
      payment_status: session.payment_status,
      customer_email: customerEmail ?? null,
    });

  } catch (err) {
    console.error('Error in verify-session:', err.message);
    return res.status(400).json({ error: 'Invalid session' });
  }
};

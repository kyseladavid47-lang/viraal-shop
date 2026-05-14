const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const DOMAIN = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'The VIRAAL Blueprint',
              description: 'Complete social media algorithm mastery guide — instant digital download.',
            },
            unit_amount: 4900,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/cancel.html`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

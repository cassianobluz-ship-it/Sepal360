const Stripe = require('stripe');

module.exports = async (req, res) => {
  // CORS para permitir chamada do app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { orgId, orgName, orgSlug, adminEmail } = req.body;
  if (!orgId || !orgName || !orgSlug) return res.status(400).json({ error: 'Campos obrigatórios faltando' });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = 'https://avalie360.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Avalie360 — Plano Personalizado',
            description: `Personalização de formulários · ${orgName} · por ciclo`,
          },
          unit_amount: 30000,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: adminEmail || undefined,
      // Retorna URL direta — mais confiável que redirectToCheckout
      success_url: `${appUrl}/${orgSlug}/login?custom_upgrade=1`,
      cancel_url: `${appUrl}/${orgSlug}/login`,
      metadata: {
        type: 'plan_custom',
        orgId,
        orgName,
        orgSlug,
        adminEmail: adminEmail || '',
      },
    });

    // Retorna tanto sessionId quanto url direta
    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};

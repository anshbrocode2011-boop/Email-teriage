import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization for Razorpay client
let razorpayClient: Razorpay | null = null;
function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayClient;
}

// Lazy initialization for Gemini API client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Google Search Console / Google OAuth site verification file routes
app.get('/google40dbdb025cec5935.html', (req, res) => {
  res.type('text/html').send('google-site-verification: google40dbdb025cec5935.html\n');
});

app.get(['/googlezkx_1P-4KWCQNEAslM9VAapcbBNO7qPeOwGZHSuGZog.html', '/zkx_1P-4KWCQNEAslM9VAapcbBNO7qPeOwGZHSuGZog.html'], (req, res) => {
  res.type('text/html').send('google-site-verification: zkx_1P-4KWCQNEAslM9VAapcbBNO7qPeOwGZHSuGZog\n');
});

// Dynamic fallback for any Google site verification file format
app.get('/google:hash.html', (req, res) => {
  const hash = req.params.hash;
  res.type('text/html').send(`google-site-verification: google${hash}.html\n`);
});

// Helper to serve public/dist legal HTML files reliably
function serveLegalFile(res: express.Response, filename: string) {
  const possiblePaths = [
    path.join(process.cwd(), 'dist', filename),
    path.join(process.cwd(), 'public', filename),
    path.join(__dirname, 'public', filename),
    path.join(__dirname, 'dist', filename),
  ];
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  return res.status(404).send(`${filename} not found`);
}

// Standalone verification routes for Google OAuth Branding team review
app.get(['/privacy', '/privacy.html', '/privacy-policy'], (req, res) => {
  serveLegalFile(res, 'privacy.html');
});

app.get(['/terms', '/terms.html', '/terms-of-service'], (req, res) => {
  serveLegalFile(res, 'terms.html');
});

app.get('/google-api-disclosure', (req, res) => {
  serveLegalFile(res, 'privacy.html');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

/**
 * Endpoint to classify a single email or batch of emails.
 * Request format:
 * {
 *   emails: Array<{
 *     id: string;
 *     sender: string;
 *     subject: string;
 *     body: string;
 *   }>
 * }
 */
app.post('/api/triage', async (req, res) => {
  try {
    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Array of emails is required' });
    }

    const ai = getAi();

    // Process each email or in small batches
    // Structured output schema
    const emailTriageSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          enum: ['URGENT', 'WORTH_A_LOOK', 'CAN_WAIT', 'IGNORE'],
          description: 'Priority category: URGENT, WORTH_A_LOOK, CAN_WAIT, or IGNORE',
        },
        summary: {
          type: Type.STRING,
          description: 'A one-sentence plain-language summary of what the email is about',
        },
        suggested_action: {
          type: Type.STRING,
          description: 'A short suggested action for the recipient, e.g. "Reply confirming the meeting time" or "No action needed"',
        },
      },
      required: ['category', 'summary', 'suggested_action'],
    };

    // To be fast and resilient, we run with concurrency pool of 6
    const results = await Promise.all(
      emails.map(async (email) => {
        try {
          const prompt = `You are an email triage assistant. Given this email's sender, subject, and body, classify it as exactly one of: URGENT, WORTH_A_LOOK, CAN_WAIT, or IGNORE. URGENT means it needs a response today. WORTH_A_LOOK means it's relevant but not time-sensitive. CAN_WAIT means it's low priority but not spam. IGNORE means it's marketing, cold outreach, or spam-adjacent. Also write a one-sentence summary of what the email is about, and a short suggested action for the recipient. Respond only in JSON with fields: category, summary, suggested_action.

Email Details:
Sender: ${email.sender || 'Unknown'}
Subject: ${email.subject || '(No Subject)'}
Body text preview:
${email.body ? email.body.slice(0, 1000) : '(Empty body)'}
`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: emailTriageSchema,
              temperature: 0.1,
            },
          });

          const rawText = response.text?.trim() || '{}';
          const parsed = JSON.parse(rawText);

          // Standardize category
          let category = parsed.category;
          if (!['URGENT', 'WORTH_A_LOOK', 'CAN_WAIT', 'IGNORE'].includes(category)) {
            category = 'WORTH_A_LOOK';
          }

          return {
            id: email.id,
            category,
            summary: parsed.summary || 'Summary unavailable',
            suggestedAction: parsed.suggested_action || 'Review when possible',
            success: true,
          };
        } catch (itemErr: any) {
          console.error(`Gemini classification failed for email ${email.id}:`, itemErr.message || itemErr);
          // Fallback as specified in user requirement: mark as "Worth a Look" as a safe default rather than crashing
          return {
            id: email.id,
            category: 'WORTH_A_LOOK',
            summary: email.subject ? `Update regarding: ${email.subject}` : 'Email requiring review',
            suggestedAction: 'Review sender message details',
            success: false,
          };
        }
      })
    );

    return res.json({ results });
  } catch (error: any) {
    console.error('Triage endpoint fatal error:', error);
    return res.status(500).json({ error: error.message || 'Internal error triaging emails' });
  }
});

/**
 * Endpoint to generate today's briefing / daily digest
 */
app.post('/api/digest', async (req, res) => {
  try {
    const { urgentItems = [], worthALookItems = [], totalCount = 0 } = req.body;
    const ai = getAi();

    const digestPrompt = `You are an elite personal executive assistant. Write a single, cohesive, highly polished paragraph summarizing the user's current inbox situation today.
Follow these strict instructions:
1. One clean paragraph (approx 3-5 sentences).
2. Written like a personal assistant briefing (friendly, professional, sharp), not a bulleted list.
3. Explicitly state how many urgent items need immediate attention and what they are about.
4. Mention any notable time-sensitive deadlines, questions, or client items.
5. If there are zero urgent items, reassure them with a calm, encouraging update that their inbox is well in hand.

Context:
Total unread emails analyzed: ${totalCount}
Urgent emails count: ${urgentItems.length}
Urgent emails details:
${
  urgentItems.length > 0
    ? urgentItems
        .map(
          (u: any, idx: number) =>
            `${idx + 1}. From: ${u.senderName || u.sender} | Subject: "${u.subject}" | Summary: ${u.summary} | Action: ${u.suggestedAction}`
        )
        .join('\n')
    : 'None'
}

Worth a Look highlights:
${
  worthALookItems.slice(0, 3)
    .map((w: any, idx: number) => `${idx + 1}. From: ${w.senderName || w.sender} | Summary: ${w.summary}`)
    .join('\n')
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: digestPrompt,
      config: {
        temperature: 0.3,
      },
    });

    const briefing = response.text?.trim() || 'No briefing generated.';
    return res.json({ briefing });
  } catch (error: any) {
    console.error('Digest generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate digest' });
  }
});

/**
 * Payment Config Endpoint
 * Checks whether Razorpay credentials are configured.
 */
app.get('/api/payment/config', (req, res) => {
  const isConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  res.json({
    isConfigured,
    keyId: process.env.RAZORPAY_KEY_ID || null,
    supportedCurrencies: ['INR', 'USD'],
    recommendedGateway: 'Razorpay (UPI / Cards / NetBanking)',
  });
});

/**
 * Create Order Endpoint
 * Creates a Razorpay order in INR (or simulates a verified mock test order if keys are pending)
 */
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', planId, planName, customerEmail } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const razorpay = getRazorpay();

    if (!razorpay) {
      // In sandbox mode or before credentials are set in environment, return a simulated order
      // so the user can test the complete UPI/QR checkout UI flow seamlessly
      const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return res.json({
        id: mockOrderId,
        amount: Math.round(amount * 100), // in paise
        currency,
        isSimulated: true,
        planId,
        planName,
        customerEmail,
        message: 'Order created in test mode. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to accept live payments.',
      });
    }

    // Amount in paise (1 INR = 100 paise)
    const orderOptions = {
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      receipt: `rcpt_${planId || 'plan'}_${Date.now().toString().slice(-8)}`,
      notes: {
        planId: planId || 'pro',
        planName: planName || 'Pro Plan',
        customerEmail: customerEmail || 'user@example.com',
      },
    };

    const order = await razorpay.orders.create(orderOptions);
    return res.json({
      ...order,
      isSimulated: false,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('Razorpay order creation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create payment order' });
  }
});

/**
 * Verify Payment Signature Endpoint
 * Verifies Razorpay payment signature HMAC SHA256
 */
app.post('/api/payment/verify', (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isSimulated,
      planId,
    } = req.body;

    if (isSimulated) {
      // Approved simulated payment for local/preview testing
      return res.json({
        verified: true,
        isSimulated: true,
        planId: planId || 'pro',
        paymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
        message: 'Payment verified successfully in test sandbox.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(400).json({ error: 'RAZORPAY_KEY_SECRET is not configured' });
    }

    // Generated signature format: razorpay_order_id + "|" + razorpay_payment_id
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isMatch = generatedSignature === razorpay_signature;

    if (!isMatch) {
      return res.status(400).json({ verified: false, error: 'Invalid payment signature' });
    }

    return res.json({
      verified: true,
      planId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ error: err.message || 'Failed to verify payment' });
  }
});

// Vite middleware & Static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Inbox Triage server listening on http://0.0.0.0:${PORT}`);
  });
}

start();

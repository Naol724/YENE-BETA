/**
 * Safaricom M-Pesa (Ethiopia sandbox / production) — OAuth + STK Push.
 * API shape matches https://apisandbox.safaricom.et (see Postman: stkpush/v3/processrequest).
 */

function baseUrl() {
  return (process.env.MPESA_BASE_URL || 'https://apisandbox.safaricom.et').replace(/\/$/, '');
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

/** E.164 without + — default Ethiopia 251 for sandbox */
function normalizePhone(raw) {
  let p = String(raw || '').replace(/\D/g, '');
  const cc = process.env.MPESA_PHONE_COUNTRY || '251';
  if (p.startsWith('0')) {
    p = cc + p.slice(1);
  } else if (p.length === 9) {
    p = cc + p;
  }
  return p;
}

function stkPassword(shortcode, passkey, ts) {
  return Buffer.from(`${shortcode}${passkey}${ts}`).toString('base64');
}

async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error('MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are required');
  }
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const url = `${baseUrl()}/v1/token/generate?grant_type=client_credentials`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Basic ${auth}` },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`M-Pesa token failed: ${res.status} ${text}`);
  }
  const data = JSON.parse(text);
  if (!data.access_token) {
    throw new Error('M-Pesa token response missing access_token');
  }
  return data.access_token;
}

/**
 * @param {object} opts
 * @param {number} opts.amount
 * @param {string} opts.phoneNumber - international digits
 * @param {string} opts.merchantRequestId - unique id we generate (tracked in DB)
 * @param {string} opts.accountReference
 * @param {string} opts.transactionDesc
 */
async function stkPush(opts) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  if (!shortcode || !passkey || !callbackUrl) {
    throw new Error('MPESA_SHORTCODE, MPESA_PASSKEY, and MPESA_CALLBACK_URL are required');
  }

  const ts = timestamp();
  const password = stkPassword(shortcode, passkey, ts);
  const phone = normalizePhone(opts.phoneNumber);
  const token = await getAccessToken();

  const body = {
    MerchantRequestID: opts.merchantRequestId,
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: ts,
    TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
    Amount: Math.round(Number(opts.amount)),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: String(opts.accountReference || 'YENEBET').slice(0, 12),
    TransactionDesc: String(opts.transactionDesc || 'Premium').slice(0, 13),
    ReferenceData: [],
  };

  const url = `${baseUrl()}/mpesa/stkpush/v3/processrequest`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`M-Pesa STK invalid JSON: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    throw new Error(data.errorMessage || data.message || `STK HTTP ${res.status}`);
  }

  return {
    raw: data,
    merchantRequestId: data.MerchantRequestID || data.merchantRequestID,
    checkoutRequestId: data.CheckoutRequestID || data.checkoutRequestID,
    responseCode: data.ResponseCode ?? data.responseCode,
    customerMessage: data.CustomerMessage || data.customerMessage,
  };
}

function isMpesaConfigured() {
  return !!(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_SHORTCODE &&
    process.env.MPESA_PASSKEY &&
    process.env.MPESA_CALLBACK_URL
  );
}

module.exports = {
  getAccessToken,
  stkPush,
  normalizePhone,
  isMpesaConfigured,
  baseUrl,
};

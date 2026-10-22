const axios = require('axios');

// MPESA_ENV=production switches to the live Daraja API; anything else is sandbox.
const BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

// Safaricom posts each STK result here. Its callbacks are not signed, so the
// URL carries a secret the callback route checks before believing anything.
const callbackUrl = () => {
  const { PUBLIC_URL, MPESA_CALLBACK_SECRET } = process.env;
  if (!PUBLIC_URL || !MPESA_CALLBACK_SECRET) {
    console.warn('PUBLIC_URL or MPESA_CALLBACK_SECRET not set: M-PESA callbacks are off, relying on status queries.');
    return 'https://example.com/callback';
  }
  const base = PUBLIC_URL.replace(/\/+$/, '');
  return `${base}/api/checkout/mpesa/callback?key=${encodeURIComponent(MPESA_CALLBACK_SECRET)}`;
};

// Daraja tokens last about an hour. Reuse one until shortly before it expires,
// and share a single in-flight fetch so a burst of checkouts asks only once.
const TOKEN_MARGIN_MS = 60 * 1000;
let cachedToken = null;
let tokenRequest = null;

const getAccessToken = async () => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }
  if (!tokenRequest) {
    tokenRequest = axios
      .get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        auth: {
          username: process.env.CONSUMER_KEY,
          password: process.env.CONSUMER_SECRET,
        },
      })
      .then(({ data }) => {
        const lifetimeMs = (Number(data.expires_in) || 3599) * 1000;
        cachedToken = { value: data.access_token, expiresAt: Date.now() + lifetimeMs - TOKEN_MARGIN_MS };
        return cachedToken.value;
      })
      .finally(() => {
        tokenRequest = null;
      });
  }
  return tokenRequest;
};

/** POSTs to Daraja with a cached token, fetching a fresh one once if it was revoked. */
const darajaPost = async (path, body) => {
  const send = async () => {
    const token = await getAccessToken();
    return axios.post(`${BASE_URL}${path}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  try {
    return (await send()).data;
  } catch (error) {
    if (error.response?.status !== 401) throw error;
    cachedToken = null;
    return (await send()).data;
  }
};

// Daraja wants YYYYMMDDHHmmss, and the same value has to go into both the
// password and the Timestamp field, so callers generate it once and pass it on.
const timestampNow = () => new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);

const passwordFor = (timestamp) =>
  Buffer.from(`${process.env.SHORTCODE}${process.env.PASSKEY}${timestamp}`).toString('base64');

/** Safaricom expects 2547XXXXXXXX / 2541XXXXXXXX. */
const normalizePhone = (input) => {
  const digits = String(input ?? '').replace(/\D/g, '');
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  return null;
};

const stkPush = async ({ phone, amount, reference, description }) => {
  const timestamp = timestampNow();
  return darajaPost('/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: process.env.SHORTCODE,
    Password: passwordFor(timestamp),
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: process.env.SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: callbackUrl(),
    AccountReference: reference,
    TransactionDesc: description,
  });
};

/** Resolves to 'success', 'failed' or 'pending', with Safaricom's code and description. */
const stkQuery = async (checkoutRequestId) => {
  const timestamp = timestampNow();

  try {
    const data = await darajaPost('/mpesa/stkpushquery/v1/query', {
      BusinessShortCode: process.env.SHORTCODE,
      Password: passwordFor(timestamp),
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    });

    const resultCode = String(data.ResultCode);
    return {
      status: resultCode === '0' ? 'success' : 'failed',
      resultCode,
      resultDesc: data.ResultDesc,
    };
  } catch (error) {
    // Safaricom answers with this code while the customer has not yet
    // responded to the prompt on their handset.
    if (error.response?.data?.errorCode === '500.001.1001') {
      return { status: 'pending' };
    }
    throw error;
  }
};

const generateQr = async ({ amount, accountReference, transactionDesc }) =>
  darajaPost('/mpesa/qrcode/v1/generate', {
    ShortCode: process.env.SHORTCODE,
    Amount: amount,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  });

module.exports = {
  getAccessToken,
  normalizePhone,
  stkPush,
  stkQuery,
  generateQr,
};

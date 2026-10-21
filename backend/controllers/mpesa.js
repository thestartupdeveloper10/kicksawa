const mpesaRouter = require("express").Router();
const axios = require('axios');

// Function to get access token
const getAccessToken = async () => {
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      auth: {
        username: process.env.CONSUMER_KEY,
        password: process.env.CONSUMER_SECRET,
      },
    });
    return response.data.access_token;
  };
  
  // Function to generate password for STK push
  const generatePassword = (timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)) => {
    const shortcode = process.env.SHORTCODE;
    const passkey = process.env.PASSKEY;
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  };
  
  // STK push endpoint
  mpesaRouter.post('/initiate-payment', async (req, res) => {
    try {
      const { phoneNumber, amount } = req.body;
      const accessToken = await getAccessToken();
  
      // STK Push request
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = generatePassword();
  
      const stkPush = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        BusinessShortCode: process.env.SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: process.env.SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: 'https://example.com/callback', // This is a placeholder
        AccountReference: 'M-PESA Demo',
        TransactionDesc: 'Payment for goods',
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      res.json(stkPush.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred', details: error.response ? error.response.data : error.message });
    }
  });
  
  // STK push status query. Lets the client find out whether the customer
  // actually approved the prompt, without needing a public CallBackURL.
  mpesaRouter.post('/payment-status', async (req, res) => {
    try {
      const { checkoutRequestId } = req.body;
      const accessToken = await getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);

      const query = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query', {
        BusinessShortCode: process.env.SHORTCODE,
        Password: generatePassword(timestamp),
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const resultCode = String(query.data.ResultCode);
      res.json({
        status: resultCode === '0' ? 'success' : 'failed',
        resultCode,
        resultDesc: query.data.ResultDesc,
      });
    } catch (error) {
      // Safaricom answers with this code while the customer has not yet
      // responded to the prompt on their handset.
      if (error.response && error.response.data && error.response.data.errorCode === '500.001.1001') {
        return res.json({ status: 'pending' });
      }
      console.error(error);
      res.status(500).json({ error: 'An error occurred', details: error.response ? error.response.data : error.message });
    }
  });

  // QR code generation endpoint
  mpesaRouter.post('/generate-qr', async (req, res) => {
    try {
      const { amount, accountReference, transactionDesc } = req.body;
      const accessToken = await getAccessToken();
  
      const response = await axios.post(
        'https://sandbox.safaricom.co.ke/mpesa/qrcode/v1/generate',
        {
          ShortCode: process.env.SHORTCODE,
          Amount: amount,
          AccountReference: accountReference,
          TransactionDesc: transactionDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred', details: error.response ? error.response.data : error.message });
    }
  });

  module.exports = mpesaRouter;
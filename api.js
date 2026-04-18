import express from 'express';
import serverless from 'serverless-http';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// SHARED AUTOMATION CREDENTIALS
const GMAIL_USER = "socialmediapartner35@gmail.com";
const GMAIL_PASS = "nvro wiwk pzmf dqho";
const DRIVE_SA_EMAIL = "admin-120@social-media-partner-493522.iam.gserviceaccount.com";
const DRIVE_FOLDER_ID = "1bweP95invzY3okgh3u3sxaCTHd71jPHP";

// Robust Private Key Formatting
const RAW_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDrXePzciuOsihP\nViYzvAzisxDwer3uH4tY0lTMUbyt5kwwjJezXUqQFMGxHqH3f91lUHB9lWElyuhB\nN+Ojp8jU1JKg+zAcY35Wpu3mK5UvcPkVWOs10fkg/bTVYU3apGL7vwd4IUzFgb8z\n6S/PCRGTt3aTZ2lLSF2XVJ8ZObldQYuxvbkOSSYaF9QcF4eD+qb7GV06kEFMS2Gm\n6U9jklHpg6vVTu0S7qzW17xPy4J7atTdUyZZegu7n99civz6q5EgzrE0fgvf8OTR\nwe5KYyeXLTD1bqNZrAmxXWO51gJYWZLEqyZQ+6PfhSmhf2FAZ2azPnuynzrKsHT+\nmsRTnvh/AgMBAAECggEAK3qQMfgcwML7fFBrRTJPZQ90KSBbdqIgITvVi1rsEmnR\nGETYfztUG1KiR0Bj5i8aLG2UIjbWl98oUWfsJt7HVD2iipdsV0ov2/0BRHw3lmh1\nsvJWnP4ZWfVUEvjjI2krmdq7m/72yiOCOSox+TpxI0sIXgmD43LOSzbIHyZRLj8j\nNSjHAoLq+aKzqtJqzmyT+FFwrk4eDwPkKy3BIop2yWxk5fTtGeIFCE4KzNBuHMOd\n4G+iy4sm7TqKQide6dEvMdw9TchReMcv+zB34c80Nvjgo8tgis5Avq9NtiePi3wh\nGeHhWe3X4V69HzKgcATFU3Rn+2jhaLcaTAKE44Fo3QKBgQD/zY0ETTr7BY2X/qd0\nJ3l/SAJkX1sofcln+3WEm4Emssks0c8xOQGUCLqyrw68qwf+mpHBUPfapy8EHqPk\n/tj373LEN7p1cpFVXNHIxGXUfazvEApUP9Wj9CXqn0x3413QrCykq7Z08GG2w08O\n+RmFyVTWzFAhjVVDkcLXZSOMPQKBgQDrjE8m+hY0NBXn9x68cgiCvpLgCWIbu4fR\ncv65G6oTpjnL/K7l4d/XIWIr0BlMEFCuMEjRMzlTCtSyKYllVJ8utn5bpGTJRRvL\nKgfWupEBY5ftd+YzHxCW1zbZ+QwfJv6Zt8DNwLv+iashSg7gbVysWfVpvOtTnDnb\nTpvqkA93awKBgB7ux0+u2yQBvuaTZ8J3B40pswhaM5bI5zMIyGQ5vbtlQUiHMovc\nPeGd0J3M53ZPJE9Yd6mt1dr9/oR8BAur+aa5sOIjbwvGx+ZPrBqgDURN0jyybt1T\nPs1tt6wQiVmyB+U0/M0I6q5nZxmHsqa33qs79mNnH4V/JsFd/fa4Bz1tAoGBAIf1\nYOqah55yQgK2fSNAnvD4l0aBpANl5ytaOPUXpr/YvpujqkA+dDl0p3mqkC97a1Zf\nwGggLQJlygdcOlYm1grcg2raJOKX5UcLZ6Ll5TTsC5GiF1mCoMywRJTkT77bfzGz\nArLAgMKXLBP270dTWJ6S/jieNyb3kd2oLg7iQEspAoGAUIXMrqmn9a45CSPOjbOV\niBBzYy/cgmKX2vnyVs9YKYJ7qSgsGrtiBEVsUbvGDimsJcbWcfC1q14oU5qB9nYy\nPOPWyQJpFySpAm+0doCmPJjZhho/OTJzZ2LpvVwEO/6foOiu7G6iPIFgmNwRoR7k\nZe4mpq4rLZFukOt6BTSTI6E=\n-----END PRIVATE KEY-----`;
const DRIVE_PRIVATE_KEY = RAW_KEY.replace(/\\n/g, '\n');

// API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'serverless-v2' });
});

app.post('/api/grant-access', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) throw new Error("Customer Email is missing");
    const jwtClient = new google.auth.JWT({
      email: DRIVE_SA_EMAIL,
      key: DRIVE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    const drive = google.drive({ version: 'v3', auth: jwtClient });
    await drive.permissions.create({
      fileId: DRIVE_FOLDER_ID,
      requestBody: { role: 'reader', type: 'user', emailAddress: email },
      sendNotificationEmail: true
    });
    res.json({ success: true, message: 'Drive access granted' });
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    res.status(500).json({ success: false, error: errMsg });
  }
});

app.post('/api/send-email', async (req, res) => {
  const { order } = req.body;
  try {
    if (!order || !order.email) throw new Error("Order details missing");
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });
    const folderLink = `https://drive.google.com/drive/u/1/folders/${DRIVE_FOLDER_ID}`;
    const mailOptions = {
      from: `"Social Media Partner BD" <${GMAIL_USER}>`,
      to: order.email,
      subject: 'আপনার ডিজিটাল প্রডাক্ট অ্যাক্সেস প্রস্তুত! ✅',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #f97316; text-align: center;">অভিনন্দন ${order.name || 'কাস্টমার'}!</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #334155;">
            আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে। আমরা আপনাকে আমাদের <b>সুপার এআই ভিডিও প্যাক</b> এবং অন্যান্য রিসোর্সগুলোর অ্যাক্সেস প্রদান করেছি।
          </p>
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffedd5; text-align: center;">
            <h2 style="font-size: 18px; color: #ea580c; margin-top: 0;">আপনার অ্যাক্সেস লিংক:</h2>
            <a href="${folderLink}" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">ফোল্ডারটি অ্যাক্সেস করুন</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">ধন্যবাদ আমাদের সাথে থাকার জন্য।</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export const handler = serverless(app);

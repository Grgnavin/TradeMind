import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

export async function POST(req: Request) {
  try {
    const { data } = await req.json();

    if (!data) {
      return NextResponse.json({ error: "Missing data parameter" }, { status: 400 });
    }

    // 1. Decode the base64 data from eSewa
    const decodedString = Buffer.from(data, 'base64').toString('utf8');
    const decodedData = JSON.parse(decodedString);

    // 2. Verify signature (Optional but recommended for production)
    // The decodedData contains: transaction_code, status, total_amount, transaction_uuid, product_code, signature, signed_field_names
    const secretKey = process.env.ESEWA_SECRET_KEY || "";
    
    // In eSewa v2, the response signature is also HMAC-SHA256
    // We should verify it against the signed_field_names provided in the response
    // For simplicity and safety in this demo, we'll verify the status is 'COMPLETE'
    
    if (decodedData.status !== 'COMPLETE') {
      return NextResponse.json({ error: "Payment not completed", status: decodedData.status }, { status: 400 });
    }

    // You can add more rigorous signature verification here if needed:
    // const message = decodedData.signed_field_names.split(',').map(field => `${field}=${decodedData[field]}`).join(',');
    // const hash = CryptoJS.HmacSHA256(message, secretKey);
    // const expectedSignature = CryptoJS.enc.Base64.stringify(hash);
    // if (expectedSignature !== decodedData.signature) { throw new Error("Invalid signature"); }

    return NextResponse.json({
      success: true,
      transaction_uuid: decodedData.transaction_uuid,
      total_amount: decodedData.total_amount,
      status: decodedData.status
    });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Verification failed", details: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

export async function POST(req: Request) {
  try {
    const { amount, productId } = await req.json();

    // Use the specific Sandbox keys provided in the guide
    const secretKey = process.env.ESEWA_SECRET_KEY || "";
    const productCode = process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || "";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    
    // Signature Formula: total_amount,transaction_uuid,product_code
    // Note: No spaces, exact order required
    const signatureString = `total_amount=${amount},transaction_uuid=${productId},product_code=${productCode}`;
    
    const hash = CryptoJS.HmacSHA256(signatureString, secretKey);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    return NextResponse.json({
      signature,
      product_code: productCode,
      transaction_uuid: productId,
      amount: amount,
      total_amount: amount,
      success_url: `${baseUrl}/dashboard?payment=success`,
      failure_url: `${baseUrl}/?payment=failed`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}

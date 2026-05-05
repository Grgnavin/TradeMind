'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

interface EsewaButtonProps {
  amount: number;
  productId: string;
  planName: string;
}

export default function EsewaButton({ amount, productId, planName }: EsewaButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Get secure signature from our API
      const res = await fetch('/api/payment/esewa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, productId })
      });
      
      const data = await res.json();

      if (!data.signature) {
        throw new Error("Payment initialization failed - no signature returned.");
      }

      // 2. Prepare the eSewa v2 Form Payload
      const path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      const esewaPayload = {
        amount: data.amount,
        tax_amount: 0,
        total_amount: data.total_amount,
        transaction_uuid: data.transaction_uuid,
        product_code: data.product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: data.success_url,
        failure_url: data.failure_url,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: data.signature,
      };

      // 3. Create and submit the form
      const form = document.createElement("form");
      form.setAttribute("method", "POST");
      form.setAttribute("action", path);

      Object.entries(esewaPayload).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
      // Cleanup
      setTimeout(() => document.body.removeChild(form), 100);
    } catch (error: any) {
      alert("Payment Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={planName === 'Pro' ? 'gold' : 'outline'} 
      className="w-full font-bold h-12 gap-2" 
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          Processing...
        </>
      ) : (
        `Pay Rs. ${amount.toLocaleString()} with eSewa`
      )}
    </Button>
  );
}

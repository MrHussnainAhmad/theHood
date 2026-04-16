"use client";

import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripe } from "@/lib/stripe-client";
import CheckoutForm from "./CheckoutForm";

interface PaymentWrapperProps {
  amount: number;
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

export default function PaymentWrapper({
  amount,
  clientSecret,
  onSuccess,
  onCancel,
}: PaymentWrapperProps) {
  const stripePromise = getStripe();

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "flat",
      labels: "floating",
      variables: {
        colorPrimary: "#c4492d",
        colorBackground: "#ffffff",
        colorText: "#14110f",
        colorDanger: "#dc2626",
        fontFamily: "DM Sans, Inter, system-ui, sans-serif",
        fontSizeBase: "15px",
        spacingUnit: "5px",
        borderRadius: "14px",
        fontWeightNormal: "500",
      },
      rules: {
        ".Tab": {
          border: "1px solid #d8cfbf",
          backgroundColor: "#fffdf8",
          boxShadow: "none",
        },
        ".Tab:hover": {
          border: "1px solid #c4492d",
        },
        ".Tab--selected": {
          border: "1px solid #c4492d",
          backgroundColor: "#fef1ec",
          boxShadow: "0 0 0 2px rgba(196, 73, 45, 0.12)",
        },
        ".Input": {
          border: "1px solid #d8cfbf",
          backgroundColor: "#ffffff",
          boxShadow: "none",
          padding: "12px",
        },
        ".Input:focus": {
          border: "1px solid #c4492d",
          boxShadow: "0 0 0 3px rgba(196, 73, 45, 0.14)",
          outline: "none",
        },
        ".Label": {
          fontWeight: "600",
          fontSize: "13px",
          marginBottom: "8px",
        },
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}

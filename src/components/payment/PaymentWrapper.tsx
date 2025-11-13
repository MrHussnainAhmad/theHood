"use client";

import { Elements } from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripe } from "@/lib/stripe-client";
import CheckoutForm from "./CheckoutForm";

interface PaymentWrapperProps {
  amount: number;
  clientSecret: string;
  onSuccess: () => void;
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
      theme: "stripe",
      labels: "floating",
      variables: {
        colorPrimary: "#0284c7",
        colorBackground: "#ffffff",
        colorText: "#171717",
        colorDanger: "#dc2626",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSizeBase: "16px",
        spacingUnit: "4px",
        borderRadius: "12px",
        fontWeightNormal: "500",
      },
      rules: {
        ".Tab": {
          border: "1px solid #e5e5e5",
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
        },
        ".Tab:hover": {
          border: "1px solid #0284c7",
          boxShadow: "0px 1px 2px rgba(2, 132, 199, 0.1)",
        },
        ".Tab--selected": {
          border: "1px solid #0284c7",
          boxShadow: "0 0 0 2px rgba(2, 132, 199, 0.1)",
        },
        ".Input": {
          border: "1px solid #e5e5e5",
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
          padding: "12px",
        },
        ".Input:focus": {
          border: "1px solid #0284c7",
          boxShadow: "0 0 0 3px rgba(2, 132, 199, 0.1)",
          outline: "none",
        },
        ".Label": {
          fontWeight: "600",
          fontSize: "14px",
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
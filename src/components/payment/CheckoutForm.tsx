"use client";

import { useState, FormEvent } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { CreditCard, Lock, Shield } from "lucide-react";

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CheckoutForm({
  amount,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Payment system is loading...");
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        console.error("Payment error:", error);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess();
      }
    } catch (error: any) {
      console.error("Payment exception:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount Display */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 border border-primary-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-600">Total Amount</span>
          <CreditCard className="w-5 h-5 text-primary-600" />
        </div>
        <p className="text-4xl font-bold text-neutral-900">
          ${amount.toFixed(2)}
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          One-time payment • No hidden fees
        </p>
      </div>

      {/* Payment Element */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-neutral-700">
          Payment Details
        </label>
        <div className="border border-neutral-200 rounded-xl p-4 bg-white shadow-sm">
          <PaymentElement 
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
            }}
          />
        </div>
      </div>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 py-4 border-t border-b border-neutral-100">
        <div className="flex items-center gap-2 text-neutral-600">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-medium">SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-600">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-medium">PCI Compliant</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!stripe || isLoading}
          isLoading={isLoading}
        >
          {isLoading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>

      {/* Footer */}
      <p className="text-xs text-center text-neutral-500 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Secured by Stripe • Your payment info is encrypted and secure
      </p>
    </form>
  );
}
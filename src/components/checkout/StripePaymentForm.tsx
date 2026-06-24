import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  ExpressCheckoutElement
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void;
  amount: number;
}

export default function StripePaymentForm({
  onSuccess,
  amount,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe is not loaded yet");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // First, submit the payment element to validate
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Validation failed");
        toast.error(submitError.message || "Please check your payment details");
        setIsProcessing(false);
        return;
      }

      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Payment failed
        console.error("Payment error:", error);
        setErrorMessage(error.message || "Payment failed");
        toast.error(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent) {
        console.log("Payment Intent:", paymentIntent);

        // Check payment status
        if (paymentIntent.status === "succeeded") {
          console.log("Payment succeeded!");
          toast.success("Payment successful!");
          onSuccess(paymentIntent.id);
        } else if (paymentIntent.status === "processing") {
          console.log("Payment processing...");
          toast.success("Payment is being processed...");
          onSuccess(paymentIntent.id);
        } else if (paymentIntent.status === "requires_payment_method") {
          toast.error("Payment failed. Please try another payment method.");
          setIsProcessing(false);
        } else {
          console.log("Payment status:", paymentIntent.status);
          toast.error(`Payment status: ${paymentIntent.status}`);
          setIsProcessing(false);
        }
      } else {
        // No error and no paymentIntent
        toast.error("Something went wrong. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Payment exception:", err);
      setErrorMessage(err.message || "Payment failed");
      toast.error("Payment failed: " + (err.message || "Unknown error"));
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Express Checkout Buttons (Apple Pay, Google Pay) */}
      <div className="mb-4">
        <ExpressCheckoutElement 
          onConfirm={() => setIsProcessing(true)} 
        />
      </div>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="px-4 text-slate-400 text-sm font-medium">Or pay with card</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Main Payment Element */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <PaymentElement
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
            paymentMethodOrder: ["card", "klarna"],
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        Payments are secure and encrypted.
      </div>

      <Button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay £${amount.toFixed(2)} Now`
        )}
      </Button>
    </form>
  );
}
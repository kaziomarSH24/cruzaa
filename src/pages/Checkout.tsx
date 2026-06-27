import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Check, CreditCard, Truck, ShieldCheck, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import checkoutService, { CheckoutPaymentMethod } from "@/services/checkoutService";
import api from "@/services/api";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from "@/components/checkout/StripePaymentForm";

let stripePromise: any = null;
const getStripe = (publishableKey: string) => {
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

const Checkout = () => {
  const { items, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<CheckoutPaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [settings, setSettings] = useState<any>({});
  const [clientSecret, setClientSecret] = useState<string>("");

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
  });

  const subtotal = getTotal();
  const threshold = parseFloat(settings.shipping_free_threshold || '0');
  const baseShipping = parseFloat(settings.shipping_fee || '0');
  const shipping = (threshold > 0 && subtotal >= threshold) ? 0 : baseShipping;
  const total = subtotal + shipping;

  // useEffect(() => {
  //   if (['stripe', 'klarna'].includes(selectedPaymentMethod) && total > 0 && step === 3) {
  //     const createPI = async () => {
  //       try {
  //         const res = await api.post('/checkout/create-payment-intent', {
  //           amount: total,
  //           payment_method: selectedPaymentMethod   // tells backend which Stripe method type
  //         });
  //         setClientSecret(res.data.data.clientSecret);
  //       } catch (e) {
  //         toast.error("Failed to initialize payment");
  //       }
  //     };
  //     createPI();
  //   }
  // }, [selectedPaymentMethod, total, step]);

  useEffect(() => {
    if (['stripe', 'klarna'].includes(selectedPaymentMethod) && total > 0 && step === 3) {
      const createSession = async () => {
        try {
          const res = await api.post('/checkout/create-checkout-session', {
            amount: total,
            email: formData.email, // Klarna
            return_url: `${window.location.origin}/order-success`
          });
          setClientSecret(res.data.data.clientSecret);
        } catch (e) {
          toast.error("Failed to initialize payment");
        }
      };
      createSession();
    }
  }, [selectedPaymentMethod, total, step, formData.email]);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const methods = await checkoutService.getPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0].code);
        }
      } catch (e) {
        toast.error("Failed to load payment methods");
      }
    };

    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/public');
        setSettings(res.data.data);
      } catch (e) {
        // Handle settings fetch error silently
      }
    };

    fetchMethods();
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Final Step: Place Order
    setLoading(true);
    try {
      const orderData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.postcode}`,
        payment_method: selectedPaymentMethod,
        total_amount: total,
        items: items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

      const res = await checkoutService.placeOrder(orderData);
      toast.success(`Order #${res.order_number} placed successfully!`);
      clearCart();
      navigate("/"); // Or to a success page
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to place order";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <Layout>
        <section className="pt-32 pb-16 min-h-screen">
          <div className="container-custom">
            <div className="max-w-md mx-auto text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
              <Link to="/products" className="btn-hero-primary">
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  const steps = [
    { number: 1, title: "Shipping", icon: Truck },
    { number: 2, title: "Payment", icon: CreditCard },
    { number: 3, title: "Confirm", icon: ShieldCheck },
  ];

  return (
    <Layout>
      <section className="pt-32 pb-16">
        <div className="container-custom">
          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {steps.map((s, index) => (
                <div key={s.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${step >= s.number
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                        }`}
                    >
                      {step > s.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <s.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${step >= s.number ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-colors ${step > s.number ? "bg-primary" : "bg-border"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card rounded-2xl border border-border p-6 md:p-8"
              >
                <form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <>
                      <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">First Name</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Last Name</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Address</label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Postcode</label>
                          <input
                            type="text"
                            name="postcode"
                            value={formData.postcode}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-border rounded-lg input-focus"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                      <div className="space-y-4">
                        {paymentMethods.length === 0 ? (
                          <div className="text-center py-4 bg-secondary rounded-lg">
                            <Loader2 className="animate-spin h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Loading payment options...</p>
                          </div>
                        ) : (
                          paymentMethods.map(method => (
                            <div
                              key={method.id}
                              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === method.code ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                              onClick={() => setSelectedPaymentMethod(method.code)}
                            >
                              <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-4 ${selectedPaymentMethod === method.code ? 'border-primary' : 'border-muted-foreground'}`}>
                                {selectedPaymentMethod === method.code && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                              </div>
                              <div>
                                <h3 className="font-bold text-sm text-foreground">{method.name}</h3>
                                <p className="text-xs text-muted-foreground">{method.description}</p>
                              </div>
                            </div>
                          ))
                        )}

                        {/* Placeholder for card details if stripe is selected */}
                        {selectedPaymentMethod === 'stripe' && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700 border border-blue-200 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 flex-shrink-0" />
                            You'll enter your card details securely on the next step via Stripe.
                          </div>
                        )}
                        {selectedPaymentMethod === 'klarna' && (
                          <div className="mt-4 p-4 rounded-lg border border-[#FFB3C7]/50 bg-[#FFF0F5] flex items-start gap-3">
                            <div className="px-2 py-0.5 bg-[#FFB3C7] text-black font-black text-[11px] rounded-sm uppercase tracking-tight flex-shrink-0 mt-0.5">Klarna.</div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">Pay in 3 interest-free instalments</p>
                              <p className="text-xs text-slate-500 mt-0.5">Klarna is processed securely via Stripe. You'll confirm your Klarna payment on the next step.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <h2 className="text-2xl font-bold mb-6">
                        {['stripe', 'klarna'].includes(selectedPaymentMethod) ? 'Complete Payment' : 'Confirm Order'}
                      </h2>

                      {['stripe', 'klarna'].includes(selectedPaymentMethod) ? (
                        <div className="space-y-6">
                          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                            <h3 className="font-semibold mb-2">Shipping To:</h3>
                            <p className="text-sm text-muted-foreground">
                              {formData.firstName} {formData.lastName}<br />
                              {formData.address}<br />
                              {formData.city}, {formData.postcode}<br />
                              {formData.phone}
                            </p>
                          </div>

                          {clientSecret && settings.stripe_publishable_key ? (
                            <Elements
                              stripe={getStripe(settings.stripe_publishable_key)}
                              options={{ clientSecret }}
                            >
                              <StripePaymentForm
                                amount={total}
                                onSuccess={(paymentIntentId) => {
                                  // Place order with payment confirmation
                                  const orderData = {
                                    customer_name: `${formData.firstName} ${formData.lastName}`,
                                    customer_email: formData.email,
                                    customer_phone: formData.phone,
                                    shipping_address: `${formData.address}, ${formData.city}, ${formData.postcode}`,
                                    payment_method: selectedPaymentMethod,
                                    payment_intent_id: paymentIntentId,
                                    total_amount: total,
                                    items: items.map(item => ({
                                      product_id: item.product.id,
                                      name: item.product.name,
                                      quantity: item.quantity,
                                      price: item.product.price
                                    }))
                                  };

                                  checkoutService.placeOrder(orderData)
                                    .then(res => {
                                      console.log("Order saved successfully:", res);
                                      if (res && res.order_number) {
                                        clearCart();
                                        navigate(`/order-success?order=${res.order_number}`);
                                      } else {
                                        console.error("Malformed success response:", res);
                                        toast.error(`Order saved, but confirmation failed. Your payment was successful (ID: ${paymentIntentId}). Please contact support with this ID.`);
                                      }
                                    })
                                    .catch(err => {
                                      console.error("Order save failure detail:", {
                                        error: err,
                                        response: err.response?.data,
                                        status: err.response?.status
                                      });

                                      const serverMsg = err.response?.data?.message || err.message || "Unknown server error";
                                      toast.error(`Payment successful (ID: ${paymentIntentId}), but order saving failed: ${serverMsg}. Please take a screenshot and contact support.`);
                                    });
                                }}
                              />
                            </Elements>
                          ) : (
                            <div className="text-center py-8">
                              <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2 text-primary" />
                              <p className="text-sm text-muted-foreground">Initializing secure payment...</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Shipping To:</h3>
                            <p className="text-muted-foreground">
                              {formData.firstName} {formData.lastName}<br />
                              {formData.address}<br />
                              {formData.city}, {formData.postcode}<br />
                              {formData.phone}
                            </p>
                          </div>
                          <div className="bg-secondary/50 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">Payment:</h3>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-muted-foreground" />
                              <span className="font-medium">
                                {paymentMethods.find(m => m.code === selectedPaymentMethod)?.name || selectedPaymentMethod}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input type="checkbox" id="terms" required className="rounded" />
                            <label htmlFor="terms">
                              I agree to the Terms & Conditions and Privacy Policy
                            </label>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex gap-4 mt-8">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        disabled={loading}
                        className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        Back
                      </button>
                    )}
                    {/* Hide submit button when Stripe payment form is active */}
                    {!(step === 3 && ['stripe', 'klarna'].includes(selectedPaymentMethod)) && (
                      <button
                        type="submit"
                        disabled={loading || (step === 2 && !selectedPaymentMethod)}
                        className="btn-hero-primary flex-1 justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (step === 3 ? "Place Order" : "Continue")}
                        {!loading && <ChevronRight className="w-5 h-5 ml-2" />}
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">
                        £{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={shipping === 0 ? "text-primary font-medium" : "font-medium"}>
                      {shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t">
                    <span>Total</span>
                    <span className="text-primary">£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, Mail } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderNumber = searchParams.get("order");

    useEffect(() => {
        // Clear any cart data
        localStorage.removeItem("cart");

        // Facebook Pixel Tracking
        // @ts-ignore
        if (window.fbq) {
            // @ts-ignore
            window.fbq('track', 'Purchase', {
                content_type: 'product',
                currency: 'GBP',
                // Note: In a real app, we'd get the actual amount from a state/context or API
            });
        }
    }, []);

    return (
        <Layout>
            <div className="min-h-screen pt-32 pb-16 bg-gradient-to-b from-green-50 to-white">
                <div className="container-custom max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                            <CheckCircle className="w-16 h-16 text-white" />
                        </div>

                        <h1 className="text-4xl font-bold text-slate-900 mb-4">
                            Payment Successful! 🎉
                        </h1>

                        <p className="text-xl text-slate-600 mb-2">
                            Thank you for your order
                        </p>

                        {orderNumber && (
                            <div className="inline-block bg-slate-100 px-6 py-3 rounded-full mb-8">
                                <p className="text-sm text-slate-500">Order Number</p>
                                <p className="text-2xl font-bold text-primary">#{orderNumber}</p>
                            </div>
                        )}

                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-8">
                            <h2 className="text-xl font-bold mb-6">What happens next?</h2>

                            <div className="space-y-4 text-left">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Order Confirmation</h3>
                                        <p className="text-sm text-slate-500">You'll receive an email confirmation shortly</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Package className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Order Processing</h3>
                                        <p className="text-sm text-slate-500">We're preparing your items for shipment</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Truck className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">Fast Delivery</h3>
                                        <p className="text-sm text-slate-500">Your order will be delivered within 3-5 business days</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate("/")}
                                className="px-8"
                            >
                                Continue Shopping
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => navigate("/products")}
                                className="px-8 bg-primary hover:bg-primary/90"
                            >
                                Browse Products
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}

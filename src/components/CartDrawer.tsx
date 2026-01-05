// Placeholder to ensure I check the file first.

import { useCartStore } from "@/store/cart";
import { useEffect, useState } from "react";
import { createOrder, validateCoupon } from "@/app/[storeSlug]/(store)/actions";
import { checkVerificationStatus, sendOtpAction, verifyOtpAction } from "@/app/actions/safety";
import { toast } from "sonner";
import { X, ShoppingBag, Minus, Plus, TicketPercent, Loader2, Check, MessageCircle, ShieldCheck, ArrowRight } from "lucide-react";

export default function CartDrawer({ isOpen, onClose, storeId }: { isOpen: boolean; onClose: () => void; storeId: string }) {
    const { items, addItem, decreaseItem, removeItem, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [couponError, setCouponError] = useState("");

    // Verification State
    const [needsVerification, setNeedsVerification] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const total = items.reduce((sum, item) => sum + (item.priceRetail * item.quantity), 0);

    const handleCheckout = async () => {
        if (!phone) {
            toast.error("Please enter your phone number so we can contact you!");
            return;
        }

        setIsCheckingOut(true);

        try {
            // 0. Check Verification Status (Trust & Safety)
            // Only check if we haven't already verified in this session (optimized by not storing session state yet, just checking DB)
            if (!needsVerification) {
                const verifyCheck = await checkVerificationStatus(phone);
                if (!verifyCheck.isVerified) {
                    setNeedsVerification(true);
                    setIsCheckingOut(false);
                    return; // STOP execution, show OTP UI
                }
            }

            // ... Proceed with checkout if verified or loop continued (logic handles skipping this block if called again after verification)

            await processOrder();

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please check your connection.");
            setIsCheckingOut(false);
        }
    };

    const processOrder = async () => {
        const finalTotal = total - (appliedDiscount?.amount || 0);

        // 1. Save "Ghost" Order
        const { orderId } = await createOrder(storeId, items, finalTotal, phone, appliedDiscount?.code);

        let msg = `Hello Store! I'd like to place an order:\n`;
        msg += `Order #${orderId.slice(-6).toUpperCase()}\n\n`;
        msg += `*Customer:* ${customerName || 'Not provided'}\n`;
        msg += `*Contact:* ${phone}\n\n`;
        msg += `*Items:*\n`;

        items.forEach((item, index) => {
            msg += `${index + 1}. ${item.name}\n`;
            msg += `   Qty: ${item.quantity} | Price: ₵${item.priceRetail}\n\n`;
        });

        msg += `*Subtotal:* ₵${total.toFixed(2)}\n`;
        if (appliedDiscount) {
            msg += `*Discount (${appliedDiscount.code}):* -₵${appliedDiscount.amount.toFixed(2)}\n`;
        }
        msg += `*Total Estimate:* ₵${finalTotal.toFixed(2)}`;

        clearCart();
        onClose();
        window.location.href = `https://wa.me/233551171353?text=${encodeURIComponent(msg)}`;
    };

    // OTP Handlers
    const [signature, setSignature] = useState("");

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        try {
            const res = await sendOtpAction(phone, 'PHONE');
            if (res.success) {
                if (res.signature) setSignature(res.signature);
                setIsOtpSent(true);
                toast.success("Code sent to WhatsApp!");
            } else {
                toast.error(res.message || "Failed to send OTP");
            }
        } catch {
            toast.error("Error sending code");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 4) {
            toast.error("Enter the code sent to your WhatsApp");
            return;
        }
        setIsSendingOtp(true);
        try {
            const res = await verifyOtpAction(phone, otp, signature);
            if (res.success) {
                toast.success("Verified! Placing order...");
                setNeedsVerification(false); // Hide UI
                // Immediately mark as verified locally to bypass check, 
                // but actually we just call processOrder() directly now to avoid race conditions/re-checks
                await processOrder();
            } else {
                toast.error(res.message || "Invalid Code");
                setIsSendingOtp(false);
            }
        } catch {
            toast.error("Verification failed");
            setIsSendingOtp(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 transition-transform duration-300 ease-out transform ${isOpen ? "translate-y-0" : "translate-y-full"} max-h-[90vh] flex flex-col`}>

                <div className="w-full max-w-xl mx-auto flex flex-col h-full">

                    {/* Handle (Visual cue) */}
                    <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-6 pb-4 flex justify-between items-center border-b border-gray-50">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                            {needsVerification ? "Verify Phone" : "My Bag"}
                            {!needsVerification && <span className="text-brand-orange text-sm font-normal">({items.length} items)</span>}
                        </h2>
                        <button onClick={onClose} title="Close cart" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition text-gray-900">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">

                        {/* Verification Overlay / View */}
                        {needsVerification ? (
                            <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-20 h-20 bg-brand-cyan/10 rounded-full flex items-center justify-center mb-6">
                                    <ShieldCheck className="text-brand-cyan" size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Unverified Number</h3>
                                <p className="text-gray-600 font-bold mb-8 max-w-xs">
                                    To ensure safe delivery, please verify your WhatsApp number
                                    <span className="text-black block mt-1">{phone}</span>
                                </p>

                                {!isOtpSent ? (
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp}
                                        className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 transition flex items-center justify-center gap-2"
                                    >
                                        {isSendingOtp ? <Loader2 className="animate-spin" /> : <>Send Code to WhatsApp <MessageCircle size={20} /></>}
                                    </button>
                                ) : (
                                    <div className="w-full space-y-4">
                                        <div className="bg-green-50 text-green-800 p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm">
                                            <Check size={16} /> Code sent!
                                        </div>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 outline-none focus:ring-4 focus:ring-brand-cyan/10 focus:border-brand-cyan bg-white font-bold text-gray-900 text-center text-3xl tracking-[0.5em]"
                                            placeholder="000000"
                                            maxLength={6}
                                        />
                                        <button
                                            onClick={handleVerifyOtp}
                                            disabled={isSendingOtp}
                                            className="w-full bg-brand-cyan text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-cyan-200 hover:shadow-2xl hover:-translate-y-1 transition flex items-center justify-center gap-2"
                                        >
                                            {isSendingOtp ? <Loader2 className="animate-spin" /> : <>Verify & Order <ArrowRight size={20} /></>}
                                        </button>
                                        <button
                                            onClick={() => setIsOtpSent(false)}
                                            className="text-sm font-bold text-gray-400 hover:text-black mt-4"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => setNeedsVerification(false)}
                                    className="text-sm font-bold text-gray-400 hover:text-red-500 mt-8"
                                >
                                    Cancel & Return to Cart
                                </button>
                            </div>
                        ) : (
                            // Normal Cart Content
                            <>
                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <ShoppingBag className="text-gray-400" size={32} />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">Your bag is empty</h3>
                                        <p className="text-sm text-gray-700 mb-6">Looks like you haven't added anything yet.</p>
                                        <button onClick={onClose} className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-bold shadow-lg hover:scale-105 transition">
                                            Start Shopping
                                        </button>
                                    </div>
                                ) : (
                                    items.map((item) => (
                                        <div key={item.id} className="flex gap-4 animate-in slide-in-from-bottom-2 duration-500">
                                            {/* Image */}
                                            <div className="w-20 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.image || "/placeholder.png"} alt={item.name} className="w-full h-full object-cover" />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{item.name}</h3>
                                                        <button title="Decrease quantity" onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1 -mr-2">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-black mt-1 font-medium">{item.category}</p>
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    <div className="text-sm font-extrabold text-black">₵{(item.priceRetail * item.quantity).toFixed(0)}</div>

                                                    {/* Quantity Control */}
                                                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                                                        <button title="Increase quantity"
                                                            onClick={() => decreaseItem(item.id)}
                                                            className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 text-gray-900"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="text-xs font-bold w-3 text-center text-gray-900">{item.quantity}</span>
                                                        <button title="Remove item"
                                                            onClick={() => addItem(item)}
                                                            className="w-6 h-6 rounded-full bg-black text-white shadow-sm flex items-center justify-center hover:bg-gray-800 transition"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer (Total & Checkout) */}
                    {items.length > 0 && !needsVerification && (
                        <div className="p-6 bg-white border-t border-gray-100 pb-8">
                            {/* Discount Code */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <label className="text-xs font-bold text-gray-800 uppercase block mb-2 flex items-center gap-2">
                                    <TicketPercent size={14} className="text-purple-600" /> Promo Code
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        disabled={!!appliedDiscount}
                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900 font-bold uppercase placeholder:text-gray-300 disabled:opacity-50 disabled:bg-gray-100"
                                    />
                                    {appliedDiscount ? (
                                        <button
                                            title="Remove coupon"
                                            onClick={() => { setAppliedDiscount(null); setCouponCode(""); }}
                                            className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold hover:bg-gray-300 transition"
                                        >
                                            <X size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                setIsValidating(true);
                                                setCouponError("");
                                                const subtotal = items.reduce((sum, item) => sum + (item.priceRetail * item.quantity), 0);
                                                const res = await validateCoupon(couponCode, storeId, subtotal);
                                                setIsValidating(false);
                                                if (res.valid) {
                                                    setAppliedDiscount({ code: res.code!, amount: res.discountAmount! });
                                                } else {
                                                    setCouponError(res.message || "Invalid Code");
                                                }
                                            }}
                                            disabled={!couponCode || isValidating}
                                            className="bg-brand-purple text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50 min-w-[80px] flex items-center justify-center shadow-lg shadow-purple-200"
                                        >
                                            {isValidating ? <Loader2 size={18} className="animate-spin" /> : "Apply"}
                                        </button>
                                    )}
                                </div>
                                {couponError && <p className="text-xs text-red-500 font-bold mt-2">{couponError}</p>}
                                {appliedDiscount && <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1"><Check size={12} /> Code applied! You saved ₵{appliedDiscount.amount.toFixed(2)}</p>}
                            </div>

                            {/* Customer Info */}
                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-800 uppercase block mb-1">Your Name / Business Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name or business..."
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan text-gray-900 font-medium placeholder:text-gray-400"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-800 uppercase block mb-1">Your Contact Number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number..."
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 font-medium placeholder:text-gray-400"
                                />
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between items-center text-gray-500 text-sm font-medium">
                                    <span>Subtotal</span>
                                    <span>₵{total.toFixed(2)}</span>
                                </div>
                                {appliedDiscount && (
                                    <div className="flex justify-between items-center text-green-600 text-sm font-bold">
                                        <span>Discount ({appliedDiscount.code})</span>
                                        <span>-₵{appliedDiscount.amount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center border-t border-gray-100 pt-2">
                                    <span className="text-black font-black text-lg">Total</span>
                                    <span className="text-2xl font-black text-black">₵{(total - (appliedDiscount?.amount || 0)).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {isCheckingOut ? (
                                    <span className="animate-pulse">Opening WhatsApp...</span>
                                ) : (
                                    <>Checkout on WhatsApp <MessageCircle size={20} /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

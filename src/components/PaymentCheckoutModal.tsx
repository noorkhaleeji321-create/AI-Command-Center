import React, { useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  Globe,
  Building,
  DollarSign,
  ArrowLeft,
  X,
  Sparkles,
  AlertCircle,
  QrCode,
  FileText,
  Upload,
  Check,
  Clock,
  Send,
  Loader2,
  Award
} from "lucide-react";
import { SubscriptionTier, Tenant, TenantInvoice } from "../types";

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlan: SubscriptionTier;
  billingCycle: "monthly" | "yearly";
  activeTenant: Tenant;
  onPaymentSuccess: (plan: SubscriptionTier, newInvoice: TenantInvoice) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  targetPlan,
  billingCycle,
  activeTenant,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"paddle_card" | "paddle_paypal" | "morocco_cmi" | "morocco_virement">("paddle_card");

  // Form fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardHolder, setCardHolder] = useState(activeTenant.ownerEmail.split("@")[0] || "Ayman El Fassi");

  // Local Moroccan Bank details
  const [selectedMoroccanBank, setSelectedMoroccanBank] = useState("attijari");
  const [virementReceipt, setVirementReceipt] = useState<string | null>(null);

  // Coupon code
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [is3DSecureActive, setIs3DSecureActive] = useState(false);
  const [secPin, setSecPin] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Pricing calculation
  const getBasePrice = (plan: SubscriptionTier) => {
    if (billingCycle === "yearly") {
      switch (plan) {
        case "starter": return 24;
        case "pro": return 79;
        case "enterprise": return 239;
        default: return 119;
      }
    } else {
      switch (plan) {
        case "starter": return 29;
        case "pro": return 99;
        case "enterprise": return 299;
        default: return 149;
      }
    }
  };

  const basePrice = getBasePrice(targetPlan);
  const discountAmount = couponApplied ? (basePrice * discountPercent) / 100 : 0;
  const finalPriceUSD = Math.max(0, basePrice - discountAmount);
  // Approximate MAD exchange rate (1 USD = 10.10 MAD)
  const finalPriceMAD = Math.round(finalPriceUSD * 10.1);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "MAROC2026" || code === "SAAS50") {
      setCouponApplied(true);
      setDiscountPercent(50);
    } else if (code === "WELCOME20") {
      setCouponApplied(true);
      setDiscountPercent(20);
    } else {
      alert("رمز الخصم غير صالح. استخدم SAAS50 للحصول على 50% خصم!");
    }
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate 3D Secure / Paddle Verification
    setTimeout(() => {
      setIsProcessing(false);
      setIs3DSecureActive(true);
    }, 1200);
  };

  const handleConfirm3DSecure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIs3DSecureActive(false);
      setIsSuccess(true);

      const invNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInvoice: TenantInvoice = {
        id: `inv_${Date.now()}`,
        tenantId: activeTenant.id,
        invoiceNumber: invNumber,
        amount: finalPriceUSD,
        currency: "USD",
        status: "paid",
        date: new Date().toISOString().split("T")[0],
      };

      setTimeout(() => {
        onPaymentSuccess(targetPlan, newInvoice);
      }, 1800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-3 md:p-4 overflow-y-auto" dir="rtl">
      <div className="w-full max-w-[98vw] 2xl:max-w-[95vw] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto font-sans relative">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>بوابة الدفع الإلكتروني والترقية (SaaS Checkout)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  {targetPlan}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                المستأجر: <span className="text-cyan-300 font-semibold">{activeTenant.name}</span> • الدفع مشفر بنسبة 100% ومعتمد
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 text-xs text-slate-300">
          
          {/* SUCCESS ANIMATION SCREEN */}
          {isSuccess ? (
            <div className="py-10 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-white">تم تأكيد عملية الدفع والترقية بنجاح!</h4>
                <p className="text-xs text-slate-400">
                  تم ترقية حساب <span className="text-cyan-300 font-bold">{activeTenant.name}</span> تلقائياً إلى خطة <span className="text-emerald-400 font-bold uppercase">{targetPlan}</span>.
                </p>
              </div>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-sm mx-auto text-slate-300 space-y-1 text-right">
                <div className="flex justify-between">
                  <span className="text-slate-400">المبلغ المدفوع:</span>
                  <span className="font-mono font-bold text-emerald-400">${finalPriceUSD} USD ({finalPriceMAD} MAD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">بوابة الدفع:</span>
                  <span className="font-bold text-cyan-300">
                    {paymentMethod.startsWith("morocco") ? "CMI Maroc / Virement" : "Paddle International"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تاريخ التجديد القادم:</span>
                  <span className="font-mono text-slate-300">2026-09-10</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 animate-pulse">جاري تحويلك وإصدار الفاتورة...</p>
            </div>
          ) : is3DSecureActive ? (
            /* 3D SECURE VERIFICATION SCREEN */
            <div className="py-6 px-4 bg-slate-900/80 border border-cyan-500/40 rounded-2xl space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-white text-sm">التوثيق البنكي المزدوج (3D Secure Verification)</h4>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono">VISA / CMI SECURE</span>
              </div>

              <div className="space-y-2">
                <p className="text-slate-300">
                  تم إرسال رمز التحقق الأمني (SMS OTP) إلى رقم هاتفك المسجل لدى البنك لتأكيد العملية بقيمة:
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-center text-lg font-bold text-emerald-400">
                  ${finalPriceUSD} USD ≈ {finalPriceMAD} MAD
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 font-bold">أدخل رمز OTP المكون من 6 أرقام (للتجربة أدخل أي 6 أرقام):</label>
                <input
                  type="text"
                  maxLength={6}
                  value={secPin}
                  onChange={(e) => setSecPin(e.target.value)}
                  placeholder="8 4 9 2 0 1"
                  className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl p-3 text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIs3DSecureActive(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  تراجع
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirm3DSecure}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-900/40"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>تأكيد الأداء المالي</span>
                </button>
              </div>
            </div>
          ) : (
            /* STANDARD CHECKOUT FORM */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Payment Method Selection & Inputs (7 cols) */}
              <div className="md:col-span-7 space-y-5">
                
                {/* Gateway Switcher */}
                <div className="space-y-2">
                  <label className="block text-slate-300 font-bold text-[11px] flex items-center justify-between">
                    <span>اختر بوابة الدفع المناسبة لك:</span>
                    <span className="text-[10px] text-cyan-400">آمن ومشفّر SSL 256-bit</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 1: International Paddle (Visa / Mastercard) */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paddle_card")}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        paymentMethod === "paddle_card"
                          ? "bg-cyan-950/30 border-cyan-500 ring-1 ring-cyan-500/50 text-white"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-bold">عالمي (International)</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">Paddle / Visa / Mastercard</p>
                        <p className="text-[10px] text-slate-400">بطاقات دولية بالدولار / اليورو</p>
                      </div>
                    </button>

                    {/* Option 2: Moroccan CMI (Carte Marocaine) */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("morocco_cmi")}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        paymentMethod === "morocco_cmi"
                          ? "bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/50 text-white"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Building className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">المغرب 🇲🇦</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">بطاقة بنكية مغربية (CMI)</p>
                        <p className="text-[10px] text-slate-400">الدفع المباشر بالدرهم المغربي (MAD)</p>
                      </div>
                    </button>

                    {/* Option 3: PayPal */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paddle_paypal")}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        paymentMethod === "paddle_paypal"
                          ? "bg-blue-950/30 border-blue-500 ring-1 ring-blue-500/50 text-white"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold">PayPal</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">حساب PayPal</p>
                        <p className="text-[10px] text-slate-400">تفعيل فوري بنقرة واحدة</p>
                      </div>
                    </button>

                    {/* Option 4: Moroccan Bank Virement / Cash Plus */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("morocco_virement")}
                      className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        paymentMethod === "morocco_virement"
                          ? "bg-purple-950/30 border-purple-500 ring-1 ring-purple-500/50 text-white"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">تحويل بنكي 🇲🇦</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">تحويل بنكي / وفاكاش</p>
                        <p className="text-[10px] text-slate-400">Attijari, BCP, CIH, Cash Plus</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* FORM INPUTS FOR CREDIT CARD (Paddle or CMI) */}
                {(paymentMethod === "paddle_card" || paymentMethod === "morocco_cmi") && (
                  <form onSubmit={handleProcessPayment} className="space-y-3">
                    {paymentMethod === "morocco_cmi" && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center justify-between">
                        <span>مقبول من كافة البنوك المغربية (Attijariwafa, BCP, BMCE, CIH, Crédit du Maroc)</span>
                        <span className="font-mono font-bold">{finalPriceMAD} MAD</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">رقم البطاقة البنكية (Card Number)</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                          placeholder="4532 •••• •••• 8910"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                          dir="ltr"
                        />
                        <CreditCard className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1 font-bold">تاريخ الانتهاء (MM/YY)</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="08/28"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center font-mono text-white focus:border-cyan-500 focus:outline-none"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1 font-bold">الرمز الأمني (CVC/CVV)</label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="892"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center font-mono text-white focus:border-cyan-500 focus:outline-none"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">اسم حامل البطاقة (Cardholder Name)</label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="AYMAN EL FASSI"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                        dir="ltr"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs transition-all cursor-pointer shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 mt-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري التواصل مع بوابة البنك...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>تأكيد واشتراك الآن (${finalPriceUSD} / {finalPriceMAD} MAD)</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* FORM INPUTS FOR PAYPAL */}
                {paymentMethod === "paddle_paypal" && (
                  <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                      <Globe className="w-6 h-6" />
                    </div>
                    <p className="text-slate-300">
                      سيتم تحويلك إلى صفحة PayPal الرسمية لإتمام الدفع بأمان.
                    </p>
                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>الانتقال لـ PayPal Express (${finalPriceUSD})</span>
                    </button>
                  </div>
                )}

                {/* FORM INPUTS FOR MOROCCAN VIREMENT */}
                {paymentMethod === "morocco_virement" && (
                  <div className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-2xl space-y-3">
                    <h4 className="font-bold text-purple-300 text-xs">معلومات التحويل البنكي المحلي بالمغرب (RIB Maroc)</h4>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px] text-slate-300" dir="ltr">
                      <p><span className="text-slate-500">Bank:</span> Attijariwafa Bank Maroc</p>
                      <p><span className="text-slate-500">Account:</span> AIWEBCRAFT SAAS SARL</p>
                      <p><span className="text-slate-500">RIB:</span> 230 780 000189201982001 92</p>
                      <p><span className="text-slate-500">Amount:</span> <strong className="text-emerald-400">{finalPriceMAD} MAD</strong></p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-400 font-bold">رفع إيصال الأداء (Reçu de Virement / Cash Plus):</label>
                      <div className="p-4 border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl text-center cursor-pointer bg-slate-950/50">
                        <Upload className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                        <span className="text-xs text-slate-400">انقر هنا لرفع الصورة أو المجموعات المرفقة</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>تأكيد وإرسال طلب التفعيل</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Right Column: Order Summary & Coupon (5 cols) */}
              <div className="md:col-span-5 space-y-4 bg-slate-900/60 p-4 border border-slate-800 rounded-2xl flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-xs border-b border-slate-800 pb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>ملخص طلب الترقية (Order Summary)</span>
                  </h4>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">اسم الخطة:</span>
                      <span className="font-bold text-white uppercase">{targetPlan} Plan</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">دورة الاشتراك:</span>
                      <span className="font-bold text-cyan-300">{billingCycle === "yearly" ? "سنوي (خصم 20%)" : "شهري"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">المبلغ الأساسي:</span>
                      <span className="font-mono text-slate-200">${basePrice} USD</span>
                    </div>

                    {couponApplied && (
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>خصم الكوبون ({discountPercent}%):</span>
                        <span className="font-mono">-${discountAmount.toFixed(1)} USD</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="font-bold text-slate-200 text-xs">المبلغ الإجمالي المالي:</span>
                      <div className="text-left font-mono">
                        <p className="text-lg font-black text-cyan-300">${finalPriceUSD} USD</p>
                        <p className="text-[10px] text-emerald-400">≈ {finalPriceMAD} MAD</p>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Form */}
                  <form onSubmit={handleApplyCoupon} className="pt-3 border-t border-slate-800 space-y-1.5">
                    <label className="block text-[11px] text-slate-400 font-bold">هل لديك كوبون خصم؟</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="أدخل SAAS50"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-xs text-white uppercase font-mono focus:border-cyan-500 focus:outline-none"
                        dir="ltr"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                      >
                        تطبيق
                      </button>
                    </div>
                    {couponApplied && (
                      <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> تم تطبيق الخصم بنجاح!
                      </p>
                    )}
                  </form>
                </div>

                {/* Guarantees Badge */}
                <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1.5 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>ضمان استرجاع الأموال خلال 14 يوماً</span>
                  </div>
                  <p>يمكنك إلغاء الاشتراك في أي وقت بنقرة واحدة بدون أي رسوم خفية.</p>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

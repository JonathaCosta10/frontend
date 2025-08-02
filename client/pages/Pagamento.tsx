import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Crown,
  Check,
  CreditCard,
  Shield,
  Star,
  Zap,
  Users,
  ArrowLeft,
  Lock,
  Calendar,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import LanguageSelector from "@/components/LanguageSelector";
import { useEffect } from "react";
import {
  paymentService,
  PaymentProviderType,
} from "@/providers/PaymentService";

export default function Pagamento() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user, loading } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login with return URL
      navigate("/login?redirect=/pagamento");
    }
  }, [isAuthenticated, loading, navigate]);
  const [selectedPlan, setSelectedPlan] = useState<"premium">("premium");
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProviderType>("mercadopago");

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">
            {t("checking_authentication")}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }
  const [billingCycle, setBillingCycle] = useState<
    "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    email: "",
    cpf: "",
  });

  const plans = {
    premium: {
      name: "Premium",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-gradient-to-r from-blue-500 to-purple-500",
      monthly: 29.9,
      quarterly: 79.9,
      yearly: 299.0,
      features: [
        t("full_crypto_access"),
        t("advanced_charts_reports"),
        t("unlimited_data_export"),
        t("unlimited_budgets"),
        t("unlimited_investments"),
        t("complete_financial_calculators"),
        t("unlimited_wishlist"),
        t("premium_economic_indicators"),
        t("priority_support"),
        t("risk_profile_analysis"),
        t("custom_reports"),
      ],
    },
  };

  const currentPlan = plans[selectedPlan];
  const price =
    billingCycle === "monthly"
      ? currentPlan.monthly
      : billingCycle === "quarterly"
        ? currentPlan.quarterly
        : currentPlan.yearly;
  const savings =
    billingCycle === "quarterly"
      ? currentPlan.monthly * 3 - currentPlan.quarterly
      : billingCycle === "yearly"
        ? currentPlan.monthly * 12 - currentPlan.yearly
        : 0;

  const handlePayment = async () => {
    if (
      !paymentData.cardNumber ||
      !paymentData.expiryDate ||
      !paymentData.cvv ||
      !paymentData.cardName ||
      !paymentData.email
    ) {
      toast({
        title: t("required_fields"),
        description: t("fill_payment_fields"),
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: t("payment_processed"),
        description: t("welcome_to_plan", { planName: currentPlan.name }),
      });
      navigate("/dashboard");
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  O
                </span>
              </div>
              <h1 className="text-2xl font-bold text-primary">Organizesee</h1>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Language and Currency Selector */}
              <LanguageSelector
                variant="compact"
                showCurrency={true}
                size="sm"
              />

              <Link to="/demo">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("back")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("choose_your_plan")}</h1>
            <p className="text-muted-foreground">
              {t("unlock_full_potential")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Selection */}
            <div className="space-y-6">
              {/* Billing Toggle */}
              <div className="flex items-center justify-center space-x-4 p-1 bg-muted rounded-lg">
                <Button
                  variant={billingCycle === "monthly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("monthly")}
                >
                  {t("monthly")}
                </Button>
                <Button
                  variant={billingCycle === "yearly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("yearly")}
                  className="relative"
                >
                  {t("annual")}
                  {billingCycle === "yearly" && (
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                      {t("two_months_free")}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Plan Cards */}
              <div className="space-y-4">
                {Object.entries(plans).map(([planKey, plan]) => (
                  <Card
                    key={planKey}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedPlan === planKey
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onClick={() =>
                      setSelectedPlan(planKey as "premium" | "enterprise")
                    }
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg text-white ${plan.color}`}
                          >
                            {plan.icon}
                          </div>
                          <div>
                            <CardTitle className="text-xl">
                              {plan.name}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold">
                                R${" "}
                                {billingCycle === "monthly"
                                  ? plan.monthly
                                  : plan.yearly}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                /
                                {billingCycle === "monthly"
                                  ? t("month")
                                  : t("year")}
                              </span>
                            </div>
                            {billingCycle === "yearly" && (
                              <p className="text-sm text-green-600">
                                {t("save_per_year", {
                                  amount: (
                                    plan.monthly * 12 -
                                    plan.yearly
                                  ).toFixed(2),
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedPlan === planKey
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedPlan === planKey && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>{t("order_summary")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>
                      {t("plan")} {currentPlan.name}
                    </span>
                    <span>R$ {price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("period")}</span>
                    <span>
                      {billingCycle === "monthly" ? t("monthly") : t("annual")}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t("annual_savings")}</span>
                      <span>-R$ {savings.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("total")}</span>
                    <span>R$ {price.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lock className="h-5 w-5" />
                    <span>{t("payment_information")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={paymentData.email}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          email: e.target.value,
                        })
                      }
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={paymentData.cpf}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cpf: e.target.value })
                      }
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">
                      {t("card_number_label")} *
                    </Label>
                    <Input
                      id="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          cardNumber: formatCardNumber(e.target.value),
                        })
                      }
                      placeholder={t("card_number_placeholder_full")}
                      maxLength={19}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">
                      {t("cardholder_name_label")} *
                    </Label>
                    <Input
                      id="cardName"
                      value={paymentData.cardName}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          cardName: e.target.value,
                        })
                      }
                      placeholder={t("cardholder_name_placeholder_full")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">
                        {t("expiry_date_label")} *
                      </Label>
                      <Input
                        id="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            expiryDate: formatExpiryDate(e.target.value),
                          })
                        }
                        placeholder={t("expiry_placeholder_full")}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">{t("cvv_label")} *</Label>
                      <Input
                        id="cvv"
                        value={paymentData.cvv}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                          })
                        }
                        placeholder={t("cvv_placeholder_full")}
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full h-12 text-lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          {t("processing_dots")}
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          {t("complete_payment_amount", {
                            amount: price.toFixed(2),
                          })}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground pt-2">
                    <Shield className="h-4 w-4" />
                    <span>{t("secure_encrypted_payment")}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Security Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">
                {t("secure_payment_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("ssl_protection")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">{t("cancel_anytime")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("no_cancellation_fees")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">{t("dedicated_support")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("specialized_team")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

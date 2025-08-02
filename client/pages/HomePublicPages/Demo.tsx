import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Moon,
  Sun,
  User,
  LogIn,
  Check,
  Star,
  Play,
  ArrowRight,
  Shield,
  Zap,
  Crown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import LanguageSelector from "@/components/LanguageSelector";

export default function Demo() {
  const [darkMode, setDarkMode] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { t } = useTranslation();

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const novo = !prev;
      document.documentElement.classList.toggle("dark", novo);
      return novo;
    });
  };

  const plans = [
    {
      name: t("free_plan"),
      price: "R$ 0",
      period: t("per_month"),
      description: t("perfect_start_organizing"),
      badge: null,
      features: [
        t("basic_dashboard"),
        t("analyze_up_to_5_funds"),
        t("monthly_reports"),
        t("email_support"),
        t("one_year_storage"),
      ],
      limitations: [
        t("limited_features"),
        t("no_advanced_technical_analysis"),
        t("no_custom_alerts"),
      ],
      buttonText: t("start_free"),
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: t("monthly_premium"),
      price: "R$ 29,90",
      period: t("per_month"),
      description: t("serious_investors_control"),
      badge: t("flexible"),
      features: [
        t("complete_dashboard"),
        t("unlimited_fund_analysis"),
        t("custom_reports"),
        t("advanced_technical_analysis"),
        t("real_time_alerts"),
        t("watchlist"),
        t("financial_calculator"),
        t("priority_support"),
        t("unlimited_storage"),
        t("data_export"),
      ],
      limitations: [],
      buttonText: t("choose_monthly"),
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: t("quarterly_premium"),
      price: "R$ 79,90",
      period: t("per_quarter"),
      description: t("three_months_discount"),
      badge: t("save_11_percent"),
      features: [
        t("complete_dashboard"),
        t("unlimited_fund_analysis"),
        t("custom_reports"),
        t("advanced_technical_analysis"),
        t("real_time_alerts"),
        t("watchlist"),
        t("financial_calculator"),
        t("priority_support"),
        t("unlimited_storage"),
        t("data_export"),
      ],
      limitations: [],
      buttonText: t("choose_quarterly"),
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: t("annual_premium"),
      price: "R$ 299,00",
      period: t("per_year"),
      description: t("twelve_months_maximum_discount"),
      badge: t("save_17_percent"),
      features: [
        t("complete_dashboard"),
        t("unlimited_fund_analysis"),
        t("custom_reports"),
        t("advanced_technical_analysis"),
        t("real_time_alerts"),
        t("watchlist"),
        t("financial_calculator"),
        t("priority_support"),
        t("unlimited_storage"),
        t("data_export"),
        t("two_months_free"),
      ],
      limitations: [],
      buttonText: t("choose_annual"),
      buttonVariant: "outline" as const,
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: t("carlos_silva_name"),
      role: t("carlos_silva_role"),
      content: t("carlos_silva_testimonial"),
      rating: 5,
    },
    {
      name: t("ana_rodrigues_name"),
      role: t("ana_rodrigues_role"),
      content: t("ana_rodrigues_testimonial"),
      rating: 5,
    },
    {
      name: t("roberto_costa_name"),
      role: t("roberto_costa_role"),
      content: t("roberto_costa_testimonial"),
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
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

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="w-9 h-9"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <div className="hidden md:flex items-center space-x-2">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{t("login")}</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{t("signup")}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section with Video */}
        <section className="text-center py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Organizesee</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("platform_description_complete")}
            </p>

            {/* Video Section */}
            <div className="mb-12">
              {!showVideo ? (
                <div className="relative bg-muted rounded-lg overflow-hidden aspect-video max-w-3xl mx-auto">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      onClick={() => setShowVideo(true)}
                      className="flex items-center space-x-2"
                    >
                      <Play className="h-6 w-6" />
                      <span>{t("watch_demonstration")}</span>
                    </Button>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5"></div>
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Dashboard Preview"
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
              ) : (
                <div className="aspect-video max-w-3xl mx-auto bg-black rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>{t("organizesee_demo_video")}</p>
                    <p className="text-sm opacity-75 mt-2">
                      {t("video_integration_development")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("plans_below")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("flexible_plans_investor_type")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-2">
                    {plan.name === t("annual_premium") && (
                      <Crown className="h-6 w-6 text-primary mr-2" />
                    )}
                    {(plan.name === t("monthly_premium") ||
                      plan.name === t("quarterly_premium")) && (
                      <Zap className="h-6 w-6 text-primary mr-2" />
                    )}
                    {plan.name === t("free_plan") && (
                      <Shield className="h-6 w-6 text-primary mr-2" />
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center space-x-2"
                      >
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}

                    {plan.limitations.map((limitation, limitIndex) => (
                      <div
                        key={limitIndex}
                        className="flex items-center space-x-2 opacity-60"
                      >
                        <div className="h-4 w-4 rounded-full border border-muted-foreground flex-shrink-0"></div>
                        <span className="text-sm line-through">
                          {limitation}
                        </span>
                      </div>
                    ))}
                  </div>

                  {plan.name === t("free_plan") ? (
                    <Link to="/signup">
                      <Button
                        variant={plan.buttonVariant}
                        className="w-full mt-6"
                        size="lg"
                      >
                        {plan.buttonText}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/pagamento">
                      <Button
                        variant={plan.buttonVariant}
                        className="w-full mt-6"
                        size="lg"
                      >
                        {plan.buttonText}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/50 rounded-lg">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("what_users_say")}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t("real_success_stories")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-current text-yellow-500"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("ready_to_start")}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("join_thousands_investors")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="flex items-center space-x-2">
                  <span>{t("start_free_today")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/market">
                <Button variant="outline" size="lg">
                  {t("explore_market_cta")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

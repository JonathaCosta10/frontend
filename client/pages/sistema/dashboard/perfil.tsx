import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Shield,
  CreditCard,
  TrendingUp,
  Target,
  Award,
  Crown,
  RefreshCw,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";

export default function Perfil() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "João Silva",
    email: "joao.silva@example.com",
    phone: "+55 11 99999-9999",
    location: "São Paulo, SP",
    birthDate: "1990-05-15",
    bio: "Desenvolvedor apaixonado por finanças pessoais e investimentos. Sempre buscando otimizar minha carteira e alcançar a independência financeira.",
    avatar: "",
  });

  const [stats] = useState({
    memberSince: "Janeiro 2023",
    totalInvestments: "R$ 150.000,00",
    monthlyBudget: "R$ 8.500,00",
    goalsAchieved: 12,
    riskProfile: t("moderate"),
  });

  const [subscriptionInfo] = useState({
    plan: "Premium",
    status: "Ativo",
    expiryDate: "2024-12-15",
    nextBilling: "2024-03-15",
    autoRenewal: true,
    paymentMethod: "**** 1234",
    monthlyPrice: "R$ 29,90",
  });

  const achievements = [
    {
      title: t("first_investment"),
      description: t("first_investment_desc"),
      icon: "🎯",
    },
    {
      title: t("monthly_goal"),
      description: t("monthly_goal_desc"),
      icon: "📈",
    },
    {
      title: t("diversification"),
      description: t("diversification_desc"),
      icon: "💼",
    },
    {
      title: t("savings"),
      description: t("savings_desc"),
      icon: "💰",
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: t("profile_updated"),
      description: t("information_saved_successfully"),
    });
  };

  const getRiskProfileColor = (risk: string) => {
    const conservativeKey = t("conservative");
    const moderateKey = t("moderate");
    const aggressiveKey = t("aggressive");

    switch (risk) {
      case conservativeKey:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case moderateKey:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case aggressiveKey:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t("my_profile")}</h1>
            <p className="text-muted-foreground">
              {t("manage_personal_information_preferences")}
            </p>
          </div>
        </div>
        <Button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{isEditing ? t("save") : t("edit")}</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Informações Principais */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{t("personal_information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar e Nome */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback className="text-lg">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-xl font-semibold"
                  />
                ) : (
                  <h2 className="text-xl font-semibold">{profile.name}</h2>
                )}
                <p className="text-muted-foreground">
                  {t("member_since")} {stats.memberSince}
                </p>
              </div>
            </div>

            <Separator />

            {/* Campos de informação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{t("email")}</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                ) : (
                  <p className="text-sm">{profile.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{t("phone")}</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                ) : (
                  <p className="text-sm">{profile.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{t("location")}</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                  />
                ) : (
                  <p className="text-sm">{profile.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="birthDate"
                  className="flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{t("birth_date")}</span>
                </Label>
                {isEditing ? (
                  <Input
                    id="birthDate"
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                  />
                ) : (
                  <p className="text-sm">
                    {new Date(profile.birthDate).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("about_me")}</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grid para as três seções abaixo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Premium */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span>{t("premium_status")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("premium_user")}
                  </span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {t("active")}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("billing_date")}
                  </span>
                  <span className="text-sm font-medium">15/03/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("full_access_valid_until")}
                  </span>
                  <span className="text-sm font-medium">15/12/2024</span>
                </div>
              </div>
              <Separator />
              <div className="text-center">
                <Link to="/dashboard/subscription">
                  <Button variant="outline" size="sm" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t("manage_subscription")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Conquistas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>{t("achievements")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="text-xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>{t("financial_summary")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("total_invested")}
                  </span>
                  <span className="font-semibold">
                    {stats.totalInvestments}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("monthly_budget")}
                  </span>
                  <span className="font-semibold">{stats.monthlyBudget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("goals_achieved")}
                  </span>
                  <span className="font-semibold">{stats.goalsAchieved}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("risk_profile")}
                  </span>
                  <Badge className={getRiskProfileColor(stats.riskProfile)}>
                    {stats.riskProfile}
                  </Badge>
                </div>
                <Link to="/dashboard/risk-assessment" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t("retake_test")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Target,
} from "lucide-react";
import { useTranslation } from '../../../contexts/TranslationContext';
import { useNavigate } from "react-router-dom";

interface Question {
  id: string;
  questionKey: string;
  options: Array<{
    value: number;
    labelKey: string;
  }>;
}

interface RiskProfile {
  score: number;
  profileKey: string;
  descriptionKey: string;
  allocationKey: string;
  investmentTypes: string[];
}

const questions: Question[] = [
  {
    id: "experience",
    questionKey: "risk_question_experience",
    options: [
      { value: 1, labelKey: "risk_option_beginner" },
      { value: 2, labelKey: "risk_option_basic" },
      { value: 3, labelKey: "risk_option_intermediate" },
      { value: 4, labelKey: "risk_option_advanced" },
    ],
  },
  {
    id: "horizon",
    questionKey: "risk_question_horizon",
    options: [
      { value: 1, labelKey: "risk_option_short_term" },
      { value: 2, labelKey: "risk_option_medium_term" },
      { value: 3, labelKey: "risk_option_long_term" },
      { value: 4, labelKey: "risk_option_very_long_term" },
    ],
  },
  {
    id: "reaction",
    questionKey: "risk_question_reaction",
    options: [
      { value: 1, labelKey: "risk_option_panic" },
      { value: 2, labelKey: "risk_option_worried" },
      { value: 3, labelKey: "risk_option_hold" },
      { value: 4, labelKey: "risk_option_buy_more" },
    ],
  },
  {
    id: "income_percentage",
    questionKey: "risk_question_income_percentage",
    options: [
      { value: 1, labelKey: "risk_option_low_percentage" },
      { value: 2, labelKey: "risk_option_moderate_percentage" },
      { value: 3, labelKey: "risk_option_high_percentage" },
      { value: 4, labelKey: "risk_option_very_high_percentage" },
    ],
  },
  {
    id: "objective",
    questionKey: "risk_question_main_objective",
    options: [
      { value: 1, labelKey: "risk_option_preservation" },
      { value: 2, labelKey: "risk_option_moderate_growth" },
      { value: 3, labelKey: "risk_option_growth" },
      { value: 4, labelKey: "risk_option_aggressive_growth" },
    ],
  },
  {
    id: "emergency_fund",
    questionKey: "risk_question_emergency_fund",
    options: [
      { value: 1, labelKey: "risk_option_no_fund" },
      { value: 2, labelKey: "risk_option_partial_fund" },
      { value: 3, labelKey: "risk_option_adequate_fund" },
      { value: 4, labelKey: "risk_option_complete_fund" },
    ],
  },
];

const riskProfiles: RiskProfile[] = [
  {
    score: 10,
    profileKey: "conservative_profile",
    descriptionKey: "conservative_description",
    allocationKey: "conservative_allocation",
    investmentTypes: ["savings_account", "cdb", "treasury_selic", "lci_lca"],
  },
  {
    score: 16,
    profileKey: "moderate_conservative_profile",
    descriptionKey: "moderate_conservative_description",
    allocationKey: "moderate_conservative_allocation",
    investmentTypes: ["treasury_ipca", "fixed_income_funds", "some_stocks"],
  },
  {
    score: 20,
    profileKey: "moderate_profile",
    descriptionKey: "moderate_description",
    allocationKey: "moderate_allocation",
    investmentTypes: ["stocks", "investment_funds", "reits"],
  },
  {
    score: 24,
    profileKey: "aggressive_profile",
    descriptionKey: "aggressive_description",
    allocationKey: "aggressive_allocation",
    investmentTypes: ["stock_funds", "derivatives", "cryptocurrencies"],
  },
];

export default function RiskAssessment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: parseInt(value),
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeAssessment();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const completeAssessment = () => {
    const totalScore = Object.values(answers).reduce(
      (sum, score) => sum + score,
      0,
    );

    let selectedProfile = riskProfiles[0]; // Default to conservative
    for (const profile of riskProfiles) {
      if (totalScore >= profile.score) {
        selectedProfile = profile;
      }
    }

    setRiskProfile(selectedProfile);
    setIsCompleted(true);
  };

  const restartAssessment = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsCompleted(false);
    setRiskProfile(null);
  };

  const getProfileColor = (profileKey: string) => {
    switch (profileKey) {
      case "conservative_profile":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "moderate_conservative_profile":
        return "bg-green-100 text-green-800 border-green-200";
      case "moderate_profile":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "aggressive_profile":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isCompleted && riskProfile) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {t("assessment_completed")}
          </h1>
          <p className="text-muted-foreground">
            {t("profile_updated_to", { profile: t(riskProfile.profileKey) })}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("your_risk_profile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge
                  className={`text-lg px-4 py-2 ${getProfileColor(riskProfile.profileKey)}`}
                >
                  {t(riskProfile.profileKey)}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t("profile_description")}</h4>
                <p className="text-sm text-muted-foreground">
                  {t(riskProfile.descriptionKey)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("recommended_allocation")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">{t("allocation")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t(riskProfile.allocationKey)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t("recommended_investments")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {riskProfile.investmentTypes.map((investmentType, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="justify-center p-2"
                >
                  {t(investmentType)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">
                  {t("important_note")}
                </h4>
                <p className="text-sm text-blue-700 mb-4">
                  {t("assessment_disclaimer")}
                </p>
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">
                    {t("about_assessment")}
                  </h5>
                  <p className="text-sm text-blue-700">
                    {t("assessment_description")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={restartAssessment}>
            {t("retake_assessment")}
          </Button>
          <Button onClick={() => navigate("/dashboard/investimentos")}>
            {t("start_investing")}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/perfil")}
          >
            {t("back_to_profile")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/perfil")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t("risk_assessment_title")}</h1>
            <p className="text-muted-foreground">{t("assessment_subtitle")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("progress_label")}</span>
            <span>
              {t("question_counter", {
                current: currentQuestionIndex + 1,
                total: questions.length,
              })}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("question_of", {
              current: currentQuestionIndex + 1,
              total: questions.length,
            })}
          </CardTitle>
          <CardDescription>{t(currentQuestion.questionKey)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={answers[currentQuestion.id]?.toString() || ""}
            onValueChange={handleAnswerChange}
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
              >
                <RadioGroupItem
                  value={option.value.toString()}
                  id={`option-${index}`}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {t(option.labelKey)}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("previous_button")}
        </Button>

        <Button
          onClick={goToNextQuestion}
          disabled={!answers[currentQuestion.id]}
        >
          {currentQuestionIndex === questions.length - 1
            ? t("finish_button")
            : t("next_button")}
          {currentQuestionIndex < questions.length - 1 && (
            <ArrowRight className="h-4 w-4 ml-2" />
          )}
        </Button>
      </div>
    </div>
  );
}

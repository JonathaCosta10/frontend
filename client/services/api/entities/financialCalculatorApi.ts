import {
  CompoundInterestInput,
  CompoundInterestResult,
  LoanInput,
  LoanResult,
  InvestmentInput,
  InvestmentResult,
} from "../../entities/FinancialCalculator";
import {
  calculateCompoundInterestMock,
  calculateLoanMock,
  calculateInvestmentMock,
} from "../mocks/examples/financialCalculatorExamples";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== "false";

// API Endpoints
const ENDPOINTS = {
  COMPOUND_INTEREST: "/financial-calculator/compound-interest",
  LOAN_CALCULATOR: "/financial-calculator/loan",
  INVESTMENT_CALCULATOR: "/financial-calculator/investment",
};

// Helper function for API calls
const apiCall = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Financial Calculator API Service
export class FinancialCalculatorApiService {
  /**
   * Calculate compound interest
   */
  static async calculateCompoundInterest(
    input: CompoundInterestInput,
  ): Promise<CompoundInterestResult> {
    if (USE_MOCK_DATA) {
      return calculateCompoundInterestMock(input);
    }

    try {
      return await apiCall<CompoundInterestResult>(
        ENDPOINTS.COMPOUND_INTEREST,
        input,
      );
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return calculateCompoundInterestMock(input);
    }
  }

  /**
   * Calculate loan payments and amortization
   */
  static async calculateLoan(input: LoanInput): Promise<LoanResult> {
    if (USE_MOCK_DATA) {
      return calculateLoanMock(input);
    }

    try {
      return await apiCall<LoanResult>(ENDPOINTS.LOAN_CALCULATOR, input);
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return calculateLoanMock(input);
    }
  }

  /**
   * Calculate investment projections
   */
  static async calculateInvestment(
    input: InvestmentInput,
  ): Promise<InvestmentResult> {
    if (USE_MOCK_DATA) {
      return calculateInvestmentMock(input);
    }

    try {
      return await apiCall<InvestmentResult>(
        ENDPOINTS.INVESTMENT_CALCULATOR,
        input,
      );
    } catch (error) {
      console.warn("API call failed, falling back to mock data:", error);
      return calculateInvestmentMock(input);
    }
  }

  /**
   * Calculate time to reach investment goal
   */
  static async calculateTimeToReachGoal(
    input: InvestmentInput,
  ): Promise<InvestmentResult> {
    const calculationInput: InvestmentInput = {
      ...input,
      type: "time",
    };
    return this.calculateInvestment(calculationInput);
  }

  /**
   * Calculate required contribution to reach investment goal
   */
  static async calculateRequiredContribution(
    input: InvestmentInput,
  ): Promise<InvestmentResult> {
    const calculationInput: InvestmentInput = {
      ...input,
      type: "contribution",
    };
    return this.calculateInvestment(calculationInput);
  }
}

// Export default methods for easier importing
export const { calculateCompoundInterest, calculateLoan, calculateInvestment, calculateTimeToReachGoal, calculateRequiredContribution } =
  FinancialCalculatorApiService;

/**
 * Financial Calculator Types
 */

// Compound Interest Calculator Types
export interface CompoundInterestInput {
  principal: number;
  contribution: number;
  rate: number;
  time: number;
  contributionFrequency?: "monthly" | "yearly";
}

export interface CompoundInterestResult {
  futureValue: number;
  totalContributions: number;
  earnings: number;
  percentageGain: number;
  monthlyData: {
    month: number;
    year: number;
    monthName: string;
    balance: number;
    totalContributed: number;
    interest: number;
    monthlyGrowth: number;
  }[];
}

// Loan Calculator Types
export interface LoanInput {
  amount: number;
  rate: number;
  term: number;
  extraPayment?: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveRate: number;
  amortizationTable: {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

// Investment Calculator Types
export interface InvestmentInput {
  monthlyAmount: number;
  years: number;
  expectedReturn: number;
  goal: number;
  type?: "contribution" | "time";
}

export interface InvestmentResult {
  monthlyContribution: number;
  yearsToReachGoal: number;
  finalBalance: number;
  totalContributed: number;
  totalEarnings: number;
  yearlyResults: {
    year: number;
    balance: number;
    contributions: number;
    earnings: number;
  }[];
}

// Retirement Calculator Types
export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  initialSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  inflationRate: number;
  desiredIncome: number;
}

export interface RetirementResult {
  retirementFund: number;
  totalContributed: number;
  yearsOfIncome: number;
  sufficientFunds: boolean;
  monthlyIncomeAtRetirement: number;
  fundDepletion?: number;
  yearlyResults: {
    year: number;
    age: number;
    balance: number;
    contributions: number;
    earnings: number;
  }[];
  withdrawalPhase?: {
    year: number;
    age: number;
    withdrawal: number;
    balance: number;
  }[];
}

import { 
  CompoundInterestResult, 
  LoanResult, 
  InvestmentResult,
  CompoundInterestInput,
  LoanInput,
  InvestmentInput 
} from '../../../entities/FinancialCalculator';

// Mock API responses for Financial Calculator
export const mockCompoundInterestResult: CompoundInterestResult = {
  futureValue: 125000.50,
  totalContributions: 80000.00,
  earnings: 45000.50,
  percentageGain: 56.25,
  monthlyData: [
    {
      month: 1,
      year: 1,
      monthName: 'Jan',
      balance: 10500.00,
      totalContributed: 10500.00,
      interest: 87.50,
      monthlyGrowth: 587.50
    },
    {
      month: 2,
      year: 1,
      monthName: 'Fev',
      balance: 11043.75,
      totalContributed: 11000.00,
      interest: 131.25,
      monthlyGrowth: 543.75
    },
    // ... more monthly data would be generated programmatically
  ]
};

export const mockLoanResult: LoanResult = {
  monthlyPayment: 1250.75,
  totalPayment: 450270.00,
  totalInterest: 150270.00,
  effectiveRate: 50.09,
  amortizationTable: [
    {
      month: 1,
      payment: 1250.75,
      principal: 417.42,
      interest: 833.33,
      balance: 299582.58
    },
    {
      month: 2,
      payment: 1250.75,
      principal: 418.81,
      interest: 831.94,
      balance: 299163.77
    },
    // ... more amortization data
  ]
};

export const mockInvestmentResult: InvestmentResult = {
  futureValue: 185000.00,
  totalInvested: 120000.00,
  profit: 65000.00,
  profitPercentage: 54.17,
  monthsToGoal: 84,
  yearsToGoal: 7,
  investmentProjection: [
    {
      year: 1,
      invested: 12000,
      value: 13200,
      profit: 1200
    },
    {
      year: 2,
      invested: 24000,
      value: 27840,
      profit: 3840
    },
    // ... more yearly projections
  ]
};

// Mock API delay simulation
export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API functions
export const calculateCompoundInterestMock = async (input: CompoundInterestInput): Promise<CompoundInterestResult> => {
  await simulateApiDelay(800);
  
  // Calculate real values based on input
  const monthlyRate = input.rate / 100 / 12;
  const totalMonths = input.time * 12;
  const monthlyData = [];
  
  let balance = input.principal;
  let totalContributed = input.principal;
  
  for (let month = 1; month <= totalMonths; month++) {
    balance = balance * (1 + monthlyRate);
    
    if (month > 1 || input.contribution > 0) {
      balance += input.contribution;
      totalContributed += input.contribution;
    }
    
    const interest = balance - totalContributed;
    
    monthlyData.push({
      month,
      year: Math.ceil(month / 12),
      monthName: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(2024, (month - 1) % 12)),
      balance,
      totalContributed,
      interest,
      monthlyGrowth: month === 1 ? balance - input.principal : balance - monthlyData[month - 2]?.balance || 0
    });
  }
  
  const earnings = balance - totalContributed;
  
  return {
    futureValue: balance,
    totalContributions: totalContributed,
    earnings,
    percentageGain: (earnings / totalContributed) * 100,
    monthlyData
  };
};

export const calculateLoanMock = async (input: LoanInput): Promise<LoanResult> => {
  await simulateApiDelay(600);
  
  const monthlyRate = input.rate / 100 / 12;
  const months = input.term * 12;
  
  // Calculate monthly payment using formula
  const monthlyPayment = (input.amount * (monthlyRate * Math.pow(1 + monthlyRate, months))) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
  
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - input.amount;
  
  // Generate amortization table
  const amortizationTable = [];
  let remainingBalance = input.amount;
  
  for (let month = 1; month <= Math.min(months, 12); month++) { // Only first 12 months for example
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    
    amortizationTable.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance
    });
  }
  
  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    effectiveRate: (totalInterest / input.amount) * 100,
    amortizationTable
  };
};

export const calculateInvestmentMock = async (input: InvestmentInput): Promise<InvestmentResult> => {
  await simulateApiDelay(700);
  
  const monthlyRate = input.expectedReturn / 100 / 12;
  const months = input.years * 12;
  
  // Calculate future value
  const futureValue = input.monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  const totalInvested = input.monthlyAmount * months;
  const profit = futureValue - totalInvested;
  
  // Calculate time to reach goal
  let monthsToGoal = undefined;
  if (input.goal && input.goal > 0) {
    monthsToGoal = Math.log(1 + (input.goal * monthlyRate) / input.monthlyAmount) / Math.log(1 + monthlyRate);
  }
  
  // Generate yearly projection
  const investmentProjection = [];
  for (let year = 1; year <= input.years; year++) {
    const yearMonths = year * 12;
    const yearValue = input.monthlyAmount * ((Math.pow(1 + monthlyRate, yearMonths) - 1) / monthlyRate);
    const yearInvested = input.monthlyAmount * yearMonths;
    
    investmentProjection.push({
      year,
      invested: yearInvested,
      value: yearValue,
      profit: yearValue - yearInvested
    });
  }
  
  return {
    futureValue,
    totalInvested,
    profit,
    profitPercentage: (profit / totalInvested) * 100,
    monthsToGoal,
    yearsToGoal: monthsToGoal ? monthsToGoal / 12 : undefined,
    investmentProjection
  };
};

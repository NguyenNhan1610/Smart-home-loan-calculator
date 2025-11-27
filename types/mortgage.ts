// Bank interest rate period
export interface InterestRate {
  months: number;
  rate: number;
}

// Prepayment fee structure
export interface PrepaymentFee {
  year: number;
  fee: number;
}

// Bank fees structure
export interface BankFees {
  appraisalFeePercent: number;
  appraisalFeeMin: number;
  appraisalFeeMax: number;
  insuranceFeePercent: number;
  notaryFeePercent: number;
  registrationFee: number;
  accountMaintenanceFee: number;
  earlyRepaymentFeeMin: number;
  disbursementFee: number;
  latePaymentPenalty: number;
}

// Discount condition
export interface DiscountCondition {
  discount: number;
  description: string;
}

// Discount conditions structure
export interface DiscountConditions {
  salaryAccount: DiscountCondition;
  existingCustomer: DiscountCondition;
  collateralAtBank: DiscountCondition;
  lifeInsurance: DiscountCondition;
  projectPartner: DiscountCondition;
  youngCustomer: DiscountCondition;
  civilServant: DiscountCondition;
  graceDiscount: DiscountCondition;
  refinance: DiscountCondition;
  maxDiscount: number;
}

// Collateral requirements
export interface CollateralRequirements {
  acceptFormedAsset: boolean;
  requiredDocuments: string[];
  minCollateralRatio: number;
  acceptedTypes: string[];
}

// Income requirements
export interface IncomeRequirements {
  minDTI: number;
  acceptedIncomeSources: string[];
  minWorkExperience: number;
  probationAccepted: boolean;
  contractTypes: string[];
}

// Processing time
export interface ProcessingTime {
  approvalDays: number;
  disbursementDays: number;
  documentValidityDays: number;
}

// Special program
export interface SpecialProgram {
  name: string;
  description: string;
  conditions: string;
  benefits: string;
}

// Main bank data structure
export interface BankData {
  name: string;
  logo: string;
  color: string;
  maxLoan: number;
  maxTerm: number;
  minAge: number;
  maxAge: number;
  maxGraceYears: number;
  minIncome: number;
  ltvRatio: number;
  interestRates: InterestRate[];
  youngRates?: InterestRate[];
  floatingRate: number;
  floatingFormula: string;
  floatingBase: string;
  floatingSpread: number;
  prepaymentFees: PrepaymentFee[];
  fees: BankFees;
  discountConditions: DiscountConditions;
  collateralRequirements: CollateralRequirements;
  incomeRequirements: IncomeRequirements;
  processingTime: ProcessingTime;
  specialPrograms: SpecialProgram[];
  specialFeatures: string[];
  eligibility: string;
  notes: string;
}

// Bank data map
export type BankDataMap = Record<string, BankData>;

// Amortization schedule entry
export interface AmortizationEntry {
  month: number;
  year: number;
  rate: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  totalInterest: number;
  totalPrincipal: number;
}

// Calculation result for a bank
export interface BankCalculation {
  bank: BankData;
  rate: number;
  floatingRate: number;
  scheduleNormal: AmortizationEntry[];
  schedulePrepay: AmortizationEntry[] | null;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  dti: number;
  effectiveRate: number;
  prepaymentFees: number;
  interestSaved: number;
  netBenefit: number;
  termSaved: number;
  isEligible: boolean;
}

// Calculation results map
export type CalculationResults = Record<string, BankCalculation>;

// Calculator input state
export interface CalculatorInputs {
  age: number;
  income: number;
  propertyValue: number;
  loanAmount: number;
  loanTerm: number;
  graceYears: number;
  fixedPeriod: number;
  enablePrepayment: boolean;
  extraPayment: number;
  startExtraYear: number;
  extraYears: number;
  isProject: boolean;
  isRefinance: boolean;
  selectedBank: string;
  compareBank: string;
}

// Chart data point
export interface ChartDataPoint {
  year: string;
  'Dư nợ (Chuẩn)': number;
  'Dư nợ (Trả trước)': number;
}

// Payment breakdown for pie chart
export interface PaymentBreakdown {
  name: string;
  value: number;
  color: string;
}

// Tab configuration
export interface TabConfig {
  id: string;
  label: string;
}

// DTI level
export interface DTILevel {
  threshold: number;
  color: string;
  label: string;
}

// New rate input
export interface NewRateInput {
  months: string;
  rate: string;
}

// New program input
export interface NewProgramInput {
  name: string;
  description: string;
  conditions: string;
  benefits: string;
}

// Per-bank comparison settings
export interface BankComparisonSettings {
  fixedPeriod: number;
  graceYears: number;
}

// Map of bank key to settings
export type BankComparisonSettingsMap = Record<string, BankComparisonSettings>;

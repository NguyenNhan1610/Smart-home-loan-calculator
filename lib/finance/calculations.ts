import type { AmortizationEntry, BankData, PrepaymentFee } from '@/types/mortgage';

// Configuration constants (can be moved to a config file later)
export const DTI_THRESHOLDS = {
  HIGH_RISK: 50,      // Above this = high risk
  MODERATE: 40,       // Above this = needs consideration
  ACCEPTABLE: 30,     // Above this = acceptable
} as const;

export const DEFAULT_YOUNG_AGE_THRESHOLD = 35;
export const DEFAULT_MAX_DISCOUNT = 1; // 1% default max discount

/**
 * Calculate monthly payment using the PMT formula
 * PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * @param principal - Loan principal amount
 * @param annualRate - Annual interest rate (percentage)
 * @param months - Total number of months
 * @returns Monthly payment amount
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  // Input validation
  if (principal <= 0) return 0;
  if (months <= 0) return 0;
  if (annualRate < 0) return 0;

  const r = annualRate / 100 / 12; // Monthly interest rate

  if (r === 0) {
    return principal / months;
  }

  const factor = Math.pow(1 + r, months);
  return principal * (r * factor) / (factor - 1);
}

/**
 * Calculate full amortization schedule with grace period and prepayment support
 *
 * @param principal - Loan principal amount
 * @param fixedRate - Fixed interest rate (percentage)
 * @param floatingRate - Floating interest rate after fixed period (percentage)
 * @param fixedMonths - Number of months at fixed rate
 * @param totalMonths - Total loan term in months
 * @param graceMonths - Number of grace months (interest-only)
 * @param extraPerYear - Extra annual payment for prepayment
 * @param startExtraYear - Year to start making extra payments
 * @returns Array of amortization schedule entries
 */
export function calculateAmortization(
  principal: number,
  fixedRate: number,
  floatingRate: number,
  fixedMonths: number,
  totalMonths: number,
  graceMonths: number,
  extraPerYear: number,
  startExtraYear: number
): AmortizationEntry[] {
  // Input validation
  if (principal <= 0 || totalMonths <= 0) {
    return [];
  }

  // Ensure valid ranges
  const validFixedMonths = Math.min(Math.max(0, fixedMonths), totalMonths);
  const validGraceMonths = Math.min(Math.max(0, graceMonths), totalMonths);
  const validExtraPerYear = Math.max(0, extraPerYear);
  const validStartExtraYear = Math.max(1, startExtraYear);

  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let month = 0;

  while (balance > 0.5 && month < totalMonths) { // Use 0.5 threshold to handle rounding
    month++;
    const year = Math.ceil(month / 12);

    // Determine rate based on fixed/floating period
    const rate = month <= validFixedMonths ? fixedRate : floatingRate;
    const r = rate / 100 / 12;

    // Calculate interest for this month
    const interest = balance * r;

    let principalPay = 0;
    let payment = interest;

    // After grace period, start paying principal
    if (month > validGraceMonths) {
      const remaining = totalMonths - month + 1;
      const pmt = calculateMonthlyPayment(balance, rate, remaining);
      payment = pmt;
      principalPay = pmt - interest;

      // Add extra payment if enabled (at end of each year starting from startExtraYear)
      if (validExtraPerYear > 0 && year >= validStartExtraYear && month % 12 === 0) {
        const extra = Math.min(validExtraPerYear, balance - principalPay);
        if (extra > 0) {
          principalPay += extra;
          payment += extra;
        }
      }
    }

    // Update balance
    balance = Math.max(0, balance - principalPay);
    totalInterest += interest;
    totalPrincipal += principalPay;

    // Round payment first, then derive principal to maintain consistency
    const roundedPayment = Math.round(payment);
    const roundedInterest = Math.round(interest);
    const roundedPrincipal = roundedPayment - roundedInterest;

    schedule.push({
      month,
      year,
      rate,
      payment: roundedPayment,
      principal: roundedPrincipal,
      interest: roundedInterest,
      balance: Math.round(balance),
      totalInterest: Math.round(totalInterest),
      totalPrincipal: Math.round(totalPrincipal),
    });

    if (balance <= 0.5) break; // Handle rounding threshold
  }

  return schedule;
}

/**
 * Calculate prepayment fee for a given year
 *
 * @param prepaymentFees - Array of prepayment fee structures
 * @param year - Year of prepayment
 * @param amount - Amount being prepaid
 * @returns Prepayment fee amount
 */
export function calculatePrepaymentFee(
  prepaymentFees: PrepaymentFee[] | undefined | null,
  year: number,
  amount: number
): number {
  // Handle empty or undefined fees array
  if (!prepaymentFees || prepaymentFees.length === 0) {
    return 0;
  }

  // Validate inputs
  if (amount <= 0 || year <= 0) {
    return 0;
  }

  // Find fee for the specific year, or use the last one (typically for year 6+)
  const fee = prepaymentFees.find(f => f.year === year) ||
              prepaymentFees[prepaymentFees.length - 1];

  if (!fee || typeof fee.fee !== 'number') {
    return 0;
  }

  return amount * (fee.fee / 100);
}

/**
 * Calculate effective interest rate based on discounts and conditions
 *
 * @param bank - Bank data
 * @param baseRate - Base interest rate
 * @param age - Borrower's age
 * @param graceYears - Grace period in years
 * @param isProject - Whether buying from partner project
 * @param isRefinance - Whether refinancing from another bank
 * @param fixedMonths - Selected fixed period in months (for young rate matching)
 * @returns Effective interest rate after discounts
 */
export function calculateEffectiveRate(
  bank: BankData,
  baseRate: number,
  age: number,
  graceYears: number,
  isProject: boolean,
  isRefinance: boolean,
  fixedMonths?: number
): number {
  let rate = baseRate;

  // Get young age threshold from bank data or use default
  const youngAgeThreshold = bank.youngAgeThreshold || DEFAULT_YOUNG_AGE_THRESHOLD;

  if (bank.discountConditions) {
    let discount = 0;

    // Apply applicable discounts
    if (graceYears > 0 && bank.discountConditions.graceDiscount?.discount) {
      discount += bank.discountConditions.graceDiscount.discount;
    }

    if (isProject && bank.discountConditions.projectPartner?.discount) {
      discount += bank.discountConditions.projectPartner.discount;
    }

    if (age <= youngAgeThreshold && bank.discountConditions.youngCustomer?.discount) {
      discount += bank.discountConditions.youngCustomer.discount;
    }

    if (isRefinance && bank.discountConditions.refinance?.discount) {
      discount += bank.discountConditions.refinance.discount;
    }

    // Apply maximum discount cap
    const maxDiscount = bank.discountConditions.maxDiscount ?? DEFAULT_MAX_DISCOUNT;
    rate -= Math.min(discount, maxDiscount);
  }

  // Check for young customer special rates
  if (age <= youngAgeThreshold && bank.youngRates && bank.youngRates.length > 0) {
    // Find young rate matching the selected fixed period, or closest available
    const targetMonths = fixedMonths ?? bank.interestRates[0]?.months ?? 12;
    const youngRate = bank.youngRates.find(r => r.months === targetMonths) ||
                      bank.youngRates.find(r => r.months >= targetMonths) ||
                      bank.youngRates[bank.youngRates.length - 1];

    if (youngRate && youngRate.rate < rate) {
      rate = youngRate.rate;
    }
  }

  // Ensure rate doesn't go negative
  return Math.max(0, rate);
}

/**
 * Calculate DTI (Debt-to-Income) ratio
 *
 * @param monthlyPayment - Monthly loan payment
 * @param monthlyIncome - Monthly income
 * @returns DTI percentage
 */
export function calculateDTI(monthlyPayment: number, monthlyIncome: number): number {
  if (monthlyIncome <= 0) return 100; // Invalid income means 100% DTI (worst case)
  if (monthlyPayment <= 0) return 0;
  return (monthlyPayment / monthlyIncome) * 100;
}

/**
 * Calculate effective annual rate using approximation method
 * This provides a more accurate measure than simple average
 *
 * For mortgage loans, we use the formula based on total cost of borrowing:
 * EAR = ((1 + periodic_rate)^periods - 1) adjusted for total payments
 *
 * @param totalPayment - Total amount paid over loan term
 * @param principal - Original loan amount
 * @param years - Loan term in years
 * @param monthlyPayment - Monthly payment amount (optional, for more accurate calc)
 * @returns Effective annual rate percentage
 */
export function calculateEffectiveAnnualRate(
  totalPayment: number,
  principal: number,
  years: number,
  monthlyPayment?: number
): number {
  // Input validation
  if (principal <= 0 || years <= 0 || totalPayment <= 0) {
    return 0;
  }

  // If we have monthly payment, use Newton-Raphson to find IRR
  if (monthlyPayment && monthlyPayment > 0) {
    const months = years * 12;
    let rate = 0.005; // Initial guess: 0.5% monthly = 6% annual

    // Newton-Raphson iteration to find monthly rate
    for (let i = 0; i < 100; i++) {
      const factor = Math.pow(1 + rate, months);
      const pv = monthlyPayment * (factor - 1) / (rate * factor);
      const pvDerivative = monthlyPayment * (
        ((factor - 1) / (rate * factor)) +
        (months * Math.pow(1 + rate, months - 1) * (rate * factor) -
         (factor - 1) * (factor + rate * months * Math.pow(1 + rate, months - 1))) /
        Math.pow(rate * factor, 2)
      );

      const diff = pv - principal;

      if (Math.abs(diff) < 0.01) {
        // Convert monthly rate to annual
        return ((Math.pow(1 + rate, 12) - 1) * 100);
      }

      rate = rate - diff / pvDerivative;

      // Bounds check
      if (rate <= 0) rate = 0.001;
      if (rate > 0.1) rate = 0.1; // Max 10% monthly = 120% annual
    }
  }

  // Fallback: Use total interest cost method
  // This gives the average annual cost as a percentage
  const totalInterest = totalPayment - principal;
  const averageBalance = principal / 2; // Approximate average balance over loan term
  const annualInterestRate = (totalInterest / averageBalance / years) * 100;

  return Math.max(0, Math.min(annualInterestRate, 100)); // Cap at reasonable bounds
}

/**
 * Check if borrower is eligible for the bank's loan
 *
 * @param bank - Bank data
 * @param age - Borrower's age
 * @param income - Monthly income
 * @returns Whether borrower is eligible
 */
export function checkEligibility(
  bank: BankData,
  age: number,
  income: number
): boolean {
  // Input validation
  if (age <= 0 || income < 0) {
    return false;
  }

  const meetsAgeRequirement = age >= bank.minAge && age <= bank.maxAge;
  const meetsIncomeRequirement = bank.minIncome === 0 || income >= bank.minIncome;

  return meetsAgeRequirement && meetsIncomeRequirement;
}

/**
 * Get DTI assessment information
 *
 * @param dti - DTI percentage
 * @param customThresholds - Optional custom thresholds (e.g., from bank data)
 * @returns Object with color and label for DTI display
 */
export function getDTIAssessment(
  dti: number,
  customThresholds?: { highRisk?: number; moderate?: number; acceptable?: number }
): { color: string; label: string } {
  const thresholds = {
    highRisk: customThresholds?.highRisk ?? DTI_THRESHOLDS.HIGH_RISK,
    moderate: customThresholds?.moderate ?? DTI_THRESHOLDS.MODERATE,
    acceptable: customThresholds?.acceptable ?? DTI_THRESHOLDS.ACCEPTABLE,
  };

  if (dti > thresholds.highRisk) {
    return { color: '#EF4444', label: 'Rủi ro cao' };
  }
  if (dti > thresholds.moderate) {
    return { color: '#F59E0B', label: 'Cần cân nhắc' };
  }
  if (dti > thresholds.acceptable) {
    return { color: '#3B82F6', label: 'Chấp nhận được' };
  }
  return { color: '#10B981', label: 'An toàn' };
}

/**
 * Validate loan parameters
 *
 * @param params - Loan parameters to validate
 * @returns Validation result with any error messages
 */
export function validateLoanParams(params: {
  principal?: number;
  years?: number;
  rate?: number;
  income?: number;
  age?: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (params.principal !== undefined && params.principal <= 0) {
    errors.push('Số tiền vay phải lớn hơn 0');
  }

  if (params.years !== undefined && (params.years <= 0 || params.years > 50)) {
    errors.push('Thời hạn vay phải từ 1-50 năm');
  }

  if (params.rate !== undefined && (params.rate < 0 || params.rate > 50)) {
    errors.push('Lãi suất phải từ 0-50%');
  }

  if (params.income !== undefined && params.income < 0) {
    errors.push('Thu nhập không hợp lệ');
  }

  if (params.age !== undefined && (params.age < 18 || params.age > 100)) {
    errors.push('Tuổi phải từ 18-100');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

import type { AmortizationEntry, BankData, PrepaymentFee } from '@/types/mortgage';

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
  const schedule: AmortizationEntry[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;
  let month = 0;

  while (balance > 0 && month < totalMonths) {
    month++;
    const year = Math.ceil(month / 12);

    // Determine rate based on fixed/floating period
    const rate = month <= fixedMonths ? fixedRate : floatingRate;
    const r = rate / 100 / 12;

    // Calculate interest for this month
    const interest = balance * r;

    let principalPay = 0;
    let payment = interest;

    // After grace period, start paying principal
    if (month > graceMonths) {
      const remaining = totalMonths - month + 1;
      const pmt = calculateMonthlyPayment(balance, rate, remaining);
      payment = pmt;
      principalPay = pmt - interest;

      // Add extra payment if enabled
      if (extraPerYear > 0 && year >= startExtraYear && month % 12 === 0) {
        const extra = Math.min(extraPerYear, balance - principalPay);
        principalPay += extra;
        payment += extra;
      }
    }

    balance = Math.max(0, balance - principalPay);
    totalInterest += interest;
    totalPrincipal += principalPay;

    schedule.push({
      month,
      year,
      rate,
      payment: Math.round(payment),
      principal: Math.round(principalPay),
      interest: Math.round(interest),
      balance: Math.round(balance),
      totalInterest: Math.round(totalInterest),
      totalPrincipal: Math.round(totalPrincipal),
    });

    if (balance <= 0) break;
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
  prepaymentFees: PrepaymentFee[],
  year: number,
  amount: number
): number {
  const fee = prepaymentFees.find(f => f.year === year) ||
              prepaymentFees[prepaymentFees.length - 1];
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
 * @returns Effective interest rate after discounts
 */
export function calculateEffectiveRate(
  bank: BankData,
  baseRate: number,
  age: number,
  graceYears: number,
  isProject: boolean,
  isRefinance: boolean
): number {
  let rate = baseRate;

  if (bank.discountConditions) {
    let discount = 0;

    // Apply applicable discounts
    if (graceYears > 0 && bank.discountConditions.graceDiscount?.discount) {
      discount += bank.discountConditions.graceDiscount.discount;
    }

    if (isProject && bank.discountConditions.projectPartner?.discount) {
      discount += bank.discountConditions.projectPartner.discount;
    }

    if (age <= 35 && bank.discountConditions.youngCustomer?.discount) {
      discount += bank.discountConditions.youngCustomer.discount;
    }

    if (isRefinance && bank.discountConditions.refinance?.discount) {
      discount += bank.discountConditions.refinance.discount;
    }

    // Apply maximum discount cap
    rate -= Math.min(discount, bank.discountConditions.maxDiscount || 1);
  }

  // Check for young customer special rates
  if (age <= 35 && bank.youngRates) {
    const youngRate = bank.youngRates.find(r => r.months <= bank.interestRates[0]?.months);
    if (youngRate) {
      rate = Math.min(rate, youngRate.rate);
    }
  }

  return rate;
}

/**
 * Calculate DTI (Debt-to-Income) ratio
 *
 * @param monthlyPayment - Monthly loan payment
 * @param monthlyIncome - Monthly income
 * @returns DTI percentage
 */
export function calculateDTI(monthlyPayment: number, monthlyIncome: number): number {
  return (monthlyPayment / monthlyIncome) * 100;
}

/**
 * Calculate effective annual rate based on total payments
 *
 * @param totalPayment - Total amount paid over loan term
 * @param principal - Original loan amount
 * @param years - Loan term in years
 * @returns Effective annual rate percentage
 */
export function calculateEffectiveAnnualRate(
  totalPayment: number,
  principal: number,
  years: number
): number {
  return ((totalPayment / principal) - 1) / years * 100;
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
  return (
    age >= bank.minAge &&
    (bank.maxAge === 65 || age <= bank.maxAge) &&
    (bank.minIncome === 0 || income >= bank.minIncome)
  );
}

/**
 * Get DTI assessment information
 *
 * @param dti - DTI percentage
 * @returns Object with color and label for DTI display
 */
export function getDTIAssessment(dti: number): { color: string; label: string } {
  if (dti > 50) {
    return { color: '#EF4444', label: 'Rủi ro cao' };
  }
  if (dti > 40) {
    return { color: '#F59E0B', label: 'Cần cân nhắc' };
  }
  if (dti > 30) {
    return { color: '#3B82F6', label: 'Chấp nhận được' };
  }
  return { color: '#10B981', label: 'An toàn' };
}

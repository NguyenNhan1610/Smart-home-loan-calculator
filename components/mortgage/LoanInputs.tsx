'use client';

import type { BankData, InterestRate } from '@/types/mortgage';
import { formatCurrency } from '@/lib/utils';

interface PersonalInfoProps {
  age: number;
  income: number;
  onAgeChange: (age: number) => void;
  onIncomeChange: (income: number) => void;
}

export function PersonalInfo({
  age,
  income,
  onAgeChange,
  onIncomeChange,
}: PersonalInfoProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">
          CN
        </span>
        Thông tin cá nhân
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Tuổi</label>
          <input
            type="range"
            min="18"
            max="65"
            value={age}
            onChange={(e) => onAgeChange(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">18</span>
            <span className="text-emerald-400 font-bold">{age} tuổi</span>
            <span className="text-slate-500">65</span>
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Thu nhập hàng tháng
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => onIncomeChange(Number(e.target.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
          />
          <p className="text-xs text-slate-500 mt-1">{formatCurrency(income)}</p>
        </div>
      </div>
    </div>
  );
}

interface LoanDetailsProps {
  currentBank: BankData | undefined;
  propertyValue: number;
  loanAmount: number;
  loanTerm: number;
  graceYears: number;
  fixedPeriod: number;
  availableRates: InterestRate[];
  onPropertyValueChange: (value: number) => void;
  onLoanAmountChange: (value: number) => void;
  onLoanTermChange: (value: number) => void;
  onGraceYearsChange: (value: number) => void;
  onFixedPeriodChange: (value: number) => void;
}

export function LoanDetails({
  currentBank,
  propertyValue,
  loanAmount,
  loanTerm,
  graceYears,
  fixedPeriod,
  availableRates,
  onPropertyValueChange,
  onLoanAmountChange,
  onLoanTermChange,
  onGraceYearsChange,
  onFixedPeriodChange,
}: LoanDetailsProps) {
  const ltvPercent = ((loanAmount / propertyValue) * 100).toFixed(0);
  const isOverLTV = currentBank && (loanAmount / propertyValue) * 100 > currentBank.ltvRatio;

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-sm">
          KV
        </span>
        Thông tin khoản vay
        <span className="text-xs text-slate-500 ml-auto">
          ({currentBank?.name})
        </span>
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Giá trị BĐS
          </label>
          <input
            type="number"
            value={propertyValue}
            onChange={(e) => onPropertyValueChange(Number(e.target.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
          />
          <p className="text-xs text-slate-500 mt-1">
            {formatCurrency(propertyValue)}
          </p>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Số tiền vay
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => onLoanAmountChange(Number(e.target.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
          />
          <p className="text-xs text-slate-500 mt-1">
            {formatCurrency(loanAmount)} ({ltvPercent}% LTV)
            {currentBank && (
              <span className={isOverLTV ? ' text-red-400' : ' text-emerald-400'}>
                {' '}(Max: {currentBank.ltvRatio}%)
              </span>
            )}
          </p>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Thời hạn: {loanTerm} năm{' '}
            <span className="text-emerald-400">(Max: {currentBank?.maxTerm})</span>
          </label>
          <input
            type="range"
            min="5"
            max={currentBank?.maxTerm || 40}
            value={loanTerm}
            onChange={(e) => onLoanTermChange(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Ân hạn gốc: {graceYears} năm{' '}
            <span className="text-amber-400">(Max: {currentBank?.maxGraceYears})</span>
          </label>
          <input
            type="range"
            min="0"
            max={currentBank?.maxGraceYears || 5}
            value={graceYears}
            onChange={(e) => onGraceYearsChange(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">
            Kỳ hạn LS cố định{' '}
            <span className="text-cyan-400">(Gói của {currentBank?.name})</span>
          </label>
          <select
            value={fixedPeriod}
            onChange={(e) => onFixedPeriodChange(Number(e.target.value))}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
          >
            {availableRates.map((r) => (
              <option key={r.months} value={r.months}>
                {r.months}T - {r.rate}%/năm
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

interface PrepaymentOptionsProps {
  enablePrepayment: boolean;
  extraPayment: number;
  startExtraYear: number;
  extraYears: number;
  onEnablePrepaymentChange: (enabled: boolean) => void;
  onExtraPaymentChange: (value: number) => void;
  onStartExtraYearChange: (value: number) => void;
  onExtraYearsChange: (value: number) => void;
}

export function PrepaymentOptions({
  enablePrepayment,
  extraPayment,
  startExtraYear,
  extraYears,
  onEnablePrepaymentChange,
  onExtraPaymentChange,
  onStartExtraYearChange,
  onExtraYearsChange,
}: PrepaymentOptionsProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-sm">
            TT
          </span>
          Trả gốc trước hạn
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enablePrepayment}
            onChange={(e) => onEnablePrepaymentChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
        </label>
      </div>

      {enablePrepayment && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Số tiền trả thêm/năm
            </label>
            <input
              type="number"
              value={extraPayment}
              onChange={(e) => onExtraPaymentChange(Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition text-white"
            />
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(extraPayment)}
            </p>
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Bắt đầu từ năm: {startExtraYear}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={startExtraYear}
              onChange={(e) => onStartExtraYearChange(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">
              Số năm: {extraYears}
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={extraYears}
              onChange={(e) => onExtraYearsChange(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}

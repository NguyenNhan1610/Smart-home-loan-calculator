'use client';

import { formatNumber } from '@/lib/utils';

interface ComparisonInputsProps {
  // Personal info
  age: number;
  income: number;
  onAgeChange: (age: number) => void;
  onIncomeChange: (income: number) => void;
  // Loan info
  propertyValue: number;
  loanAmount: number;
  loanTerm: number;
  onPropertyValueChange: (value: number) => void;
  onLoanAmountChange: (value: number) => void;
  onLoanTermChange: (value: number) => void;
  // Additional conditions
  isProject: boolean;
  isRefinance: boolean;
  onIsProjectChange: (value: boolean) => void;
  onIsRefinanceChange: (value: boolean) => void;
  // Prepayment (optional)
  enablePrepayment: boolean;
  extraPayment: number;
  startExtraYear: number;
  onEnablePrepaymentChange: (value: boolean) => void;
  onExtraPaymentChange: (value: number) => void;
  onStartExtraYearChange: (value: number) => void;
}

export function ComparisonInputs({
  age,
  income,
  onAgeChange,
  onIncomeChange,
  propertyValue,
  loanAmount,
  loanTerm,
  onPropertyValueChange,
  onLoanAmountChange,
  onLoanTermChange,
  isProject,
  isRefinance,
  onIsProjectChange,
  onIsRefinanceChange,
  enablePrepayment,
  extraPayment,
  startExtraYear,
  onEnablePrepaymentChange,
  onExtraPaymentChange,
  onStartExtraYearChange,
}: ComparisonInputsProps) {
  const ltv = propertyValue > 0 ? ((loanAmount / propertyValue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-300">
          <span className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs">
            👤
          </span>
          Thông tin cá nhân
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tuổi</label>
            <input
              type="number"
              value={age}
              onChange={(e) => onAgeChange(Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
              min={18}
              max={70}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Thu nhập/tháng</label>
            <input
              type="text"
              value={formatNumber(income)}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '');
                onIncomeChange(Number(val) || 0);
              }}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Loan Info */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-300">
          <span className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs">
            💰
          </span>
          Thông tin khoản vay
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Giá trị BĐS</label>
            <input
              type="text"
              value={formatNumber(propertyValue)}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '');
                onPropertyValueChange(Number(val) || 0);
              }}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs text-slate-400">Số tiền vay</label>
              <span className="text-xs text-emerald-400">LTV: {ltv}%</span>
            </div>
            <input
              type="text"
              value={formatNumber(loanAmount)}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '');
                onLoanAmountChange(Number(val) || 0);
              }}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Thời hạn vay (năm)</label>
            <input
              type="number"
              value={loanTerm}
              onChange={(e) => onLoanTermChange(Number(e.target.value))}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
              min={1}
              max={35}
            />
          </div>
        </div>
      </div>

      {/* Prepayment Options */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enablePrepayment}
            onChange={(e) => onEnablePrepaymentChange(e.target.checked)}
            className="w-4 h-4 accent-emerald-500"
          />
          <span className="text-sm font-medium text-slate-300">Trả gốc trước hạn</span>
        </label>

        {enablePrepayment && (
          <div className="mt-3 space-y-3 pt-3 border-t border-slate-700/50">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Số tiền trả thêm/năm</label>
              <input
                type="text"
                value={formatNumber(extraPayment)}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '');
                  onExtraPaymentChange(Number(val) || 0);
                }}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Bắt đầu từ năm thứ</label>
              <input
                type="number"
                value={startExtraYear}
                onChange={(e) => onStartExtraYearChange(Number(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
                min={1}
                max={loanTerm}
              />
            </div>
          </div>
        )}
      </div>

      {/* Additional Conditions */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-300">
          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-xs">
            ⚡
          </span>
          Điều kiện bổ sung
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isProject}
              onChange={(e) => onIsProjectChange(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span className="text-xs text-slate-300">Mua nhà dự án liên kết</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRefinance}
              onChange={(e) => onIsRefinanceChange(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span className="text-xs text-slate-300">Trả nợ trước hạn từ NH khác</span>
          </label>
        </div>
      </div>
    </div>
  );
}

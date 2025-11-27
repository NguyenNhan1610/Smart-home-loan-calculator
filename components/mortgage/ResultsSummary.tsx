'use client';

import type { BankCalculation } from '@/types/mortgage';
import { formatCurrency } from '@/lib/utils';
import { getDTIAssessment } from '@/lib/finance';

interface ResultsSummaryProps {
  calculation: BankCalculation | undefined;
}

export function ResultsSummary({ calculation }: ResultsSummaryProps) {
  if (!calculation) return null;

  const dtiAssessment = getDTIAssessment(calculation.dti);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur rounded-2xl p-4 border border-emerald-500/30">
          <p className="text-xs text-emerald-300 mb-1">Trả hàng tháng</p>
          <p className="text-xl font-bold text-emerald-400">
            {formatCurrency(calculation.monthlyPayment)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur rounded-2xl p-4 border border-amber-500/30">
          <p className="text-xs text-amber-300 mb-1">Tổng lãi</p>
          <p className="text-xl font-bold text-amber-400">
            {formatCurrency(calculation.totalInterest)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur rounded-2xl p-4 border border-blue-500/30">
          <p className="text-xs text-blue-300 mb-1">LS hiệu dụng</p>
          <p className="text-xl font-bold text-blue-400">
            {calculation.effectiveRate.toFixed(2)}%/năm
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur rounded-2xl p-4 border border-purple-500/30">
          <p className="text-xs text-purple-300 mb-1">Tổng thanh toán</p>
          <p className="text-xl font-bold text-purple-400">
            {formatCurrency(calculation.totalPayment)}
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Tỷ lệ DTI</h4>
            <DTIIndicator dti={calculation.dti} assessment={dtiAssessment} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Điều kiện vay
            </h4>
            <div
              className={`flex items-center gap-2 p-3 rounded-xl ${
                calculation.isEligible
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              <span className="text-xl">
                {calculation.isEligible ? '✓' : '✗'}
              </span>
              <span className="text-sm font-medium">
                {calculation.isEligible ? 'Đủ điều kiện' : 'Không đủ điều kiện'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface DTIIndicatorProps {
  dti: number;
  assessment: { color: string; label: string };
}

function DTIIndicator({ dti, assessment }: DTIIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(dti, 100)}%`,
            backgroundColor: assessment.color,
          }}
        />
      </div>
      <span className="text-sm font-medium" style={{ color: assessment.color }}>
        {dti.toFixed(1)}% - {assessment.label}
      </span>
    </div>
  );
}

interface PrepaymentAnalysisProps {
  calculation: BankCalculation;
}

export function PrepaymentAnalysis({ calculation }: PrepaymentAnalysisProps) {
  const isPositive = calculation.netBenefit >= 0;

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur rounded-2xl p-5 border border-amber-500/30">
      <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
        Phân tích trả trước hạn
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-slate-800/50 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Lãi tiết kiệm</p>
          <p className="text-lg font-bold text-emerald-400">
            {formatCurrency(calculation.interestSaved)}
          </p>
        </div>
        <div className="text-center p-3 bg-slate-800/50 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Phí phạt</p>
          <p className="text-lg font-bold text-red-400">
            {formatCurrency(calculation.prepaymentFees)}
          </p>
        </div>
        <div className="text-center p-3 bg-slate-800/50 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Lợi ích ròng</p>
          <p className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(calculation.netBenefit)}
          </p>
        </div>
        <div className="text-center p-3 bg-slate-800/50 rounded-xl">
          <p className="text-xs text-slate-400 mb-1">Rút ngắn</p>
          <p className="text-lg font-bold text-blue-400">
            {Math.floor(calculation.termSaved / 12)}N {calculation.termSaved % 12}T
          </p>
        </div>
      </div>
      <div
        className={`mt-4 p-4 rounded-xl ${
          isPositive
            ? 'bg-emerald-500/20 border border-emerald-500/30'
            : 'bg-red-500/20 border border-red-500/30'
        }`}
      >
        <p className="font-semibold flex items-center gap-2">
          {isPositive ? (
            <>Khuyến nghị: NÊN trả trước hạn</>
          ) : (
            <>Khuyến nghị: KHÔNG NÊN trả trước</>
          )}
        </p>
      </div>
    </div>
  );
}

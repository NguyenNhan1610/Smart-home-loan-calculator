'use client';

import type { BankCalculation } from '@/types/mortgage';
import { formatCurrency } from '@/lib/utils';

interface ComparisonSummaryCardsProps {
  calculations: Record<string, BankCalculation>;
  selectedBanks: string[];
}

interface BestOption {
  bankKey: string;
  bankName: string;
  value: number;
  color: string;
}

export function ComparisonSummaryCards({
  calculations,
  selectedBanks,
}: ComparisonSummaryCardsProps) {
  if (selectedBanks.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50 text-center">
        <p className="text-slate-400">Chọn ít nhất một ngân hàng để xem so sánh</p>
      </div>
    );
  }

  // Find best options for each category
  const findBest = (
    key: keyof BankCalculation,
    preferLower: boolean = true
  ): BestOption | null => {
    let best: BestOption | null = null;

    for (const bankKey of selectedBanks) {
      const calc = calculations[bankKey];
      if (!calc) continue;

      const value = calc[key] as number;
      if (
        best === null ||
        (preferLower ? value < best.value : value > best.value)
      ) {
        best = {
          bankKey,
          bankName: calc.bank.name,
          value,
          color: calc.bank.color,
        };
      }
    }

    return best;
  };

  const bestRate = findBest('rate', true);
  const bestMonthly = findBest('monthlyPayment', true);
  const bestTotalInterest = findBest('totalInterest', true);
  const bestTotal = findBest('totalPayment', true);
  const bestDTI = findBest('dti', true);
  const bestEffectiveRate = findBest('effectiveRate', true);

  const cards = [
    {
      title: 'Lãi suất thấp nhất',
      best: bestRate,
      format: (v: number) => `${v.toFixed(2)}%/năm`,
      gradient: 'from-emerald-500/20 to-emerald-600/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      labelColor: 'text-emerald-300',
    },
    {
      title: 'Trả hàng tháng thấp nhất',
      best: bestMonthly,
      format: formatCurrency,
      gradient: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      labelColor: 'text-blue-300',
    },
    {
      title: 'Tổng lãi thấp nhất',
      best: bestTotalInterest,
      format: formatCurrency,
      gradient: 'from-amber-500/20 to-amber-600/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      labelColor: 'text-amber-300',
    },
    {
      title: 'Tổng thanh toán thấp nhất',
      best: bestTotal,
      format: formatCurrency,
      gradient: 'from-purple-500/20 to-purple-600/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      labelColor: 'text-purple-300',
    },
    {
      title: 'DTI thấp nhất',
      best: bestDTI,
      format: (v: number) => `${v.toFixed(1)}%`,
      gradient: 'from-cyan-500/20 to-cyan-600/10',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
      labelColor: 'text-cyan-300',
    },
    {
      title: 'LS hiệu dụng thấp nhất',
      best: bestEffectiveRate,
      format: (v: number) => `${v.toFixed(2)}%/năm`,
      gradient: 'from-rose-500/20 to-rose-600/10',
      borderColor: 'border-rose-500/30',
      textColor: 'text-rose-400',
      labelColor: 'text-rose-300',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        Ngân hàng tốt nhất theo tiêu chí
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${card.gradient} backdrop-blur rounded-xl p-4 border ${card.borderColor}`}
          >
            <p className={`text-xs ${card.labelColor} mb-2`}>{card.title}</p>
            {card.best ? (
              <>
                <p className={`text-lg font-bold ${card.textColor} mb-1`}>
                  {card.format(card.best.value)}
                </p>
                <div className="flex items-center gap-1">
                  <span
                    className="w-4 h-4 rounded text-xs flex items-center justify-center font-bold"
                    style={{ backgroundColor: `${card.best.color}30`, color: card.best.color }}
                  >
                    {calculations[card.best.bankKey]?.bank.logo}
                  </span>
                  <span className="text-xs text-slate-300 truncate">
                    {card.best.bankName}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">N/A</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

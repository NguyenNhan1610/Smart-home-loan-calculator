'use client';

import { Fragment } from 'react';
import type { BankCalculation } from '@/types/mortgage';
import { formatNumber } from '@/lib/utils';

interface DetailedComparisonTableProps {
  calculations: Record<string, BankCalculation>;
  selectedBanks: string[];
}

interface TableRow {
  category: string;
  label: string;
  key: string;
  format: (value: number) => string;
  preferLower: boolean;
  unit?: string;
}

const tableRows: TableRow[] = [
  // Lãi suất
  { category: 'Lãi suất', label: 'Lãi suất ưu đãi', key: 'rate', format: (v) => v.toFixed(2), preferLower: true, unit: '%/năm' },
  { category: 'Lãi suất', label: 'Lãi suất thả nổi', key: 'floatingRate', format: (v) => v.toFixed(2), preferLower: true, unit: '%/năm' },
  { category: 'Lãi suất', label: 'LS hiệu dụng', key: 'effectiveRate', format: (v) => v.toFixed(2), preferLower: true, unit: '%/năm' },

  // Thanh toán
  { category: 'Thanh toán', label: 'Trả hàng tháng', key: 'monthlyPayment', format: formatNumber, preferLower: true },
  { category: 'Thanh toán', label: 'Tổng lãi phải trả', key: 'totalInterest', format: formatNumber, preferLower: true },
  { category: 'Thanh toán', label: 'Tổng thanh toán', key: 'totalPayment', format: formatNumber, preferLower: true },

  // Đánh giá
  { category: 'Đánh giá', label: 'Tỷ lệ DTI', key: 'dti', format: (v) => v.toFixed(1), preferLower: true, unit: '%' },

  // Trả trước hạn
  { category: 'Trả trước hạn', label: 'Lãi tiết kiệm', key: 'interestSaved', format: formatNumber, preferLower: false },
  { category: 'Trả trước hạn', label: 'Phí phạt', key: 'prepaymentFees', format: formatNumber, preferLower: true },
  { category: 'Trả trước hạn', label: 'Lợi ích ròng', key: 'netBenefit', format: formatNumber, preferLower: false },
  { category: 'Trả trước hạn', label: 'Rút ngắn', key: 'termSaved', format: (v) => `${Math.floor(v / 12)}N ${v % 12}T`, preferLower: false },
];

export function DetailedComparisonTable({
  calculations,
  selectedBanks,
}: DetailedComparisonTableProps) {
  if (selectedBanks.length === 0) {
    return null;
  }

  // Find best value for each row
  const findBestValue = (key: string, preferLower: boolean): number | null => {
    let best: number | null = null;

    for (const bankKey of selectedBanks) {
      const calc = calculations[bankKey];
      if (!calc) continue;

      const value = calc[key as keyof BankCalculation] as number;
      if (typeof value !== 'number') continue;

      if (
        best === null ||
        (preferLower ? value < best : value > best)
      ) {
        best = value;
      }
    }

    return best;
  };

  // Group rows by category
  const categories = [...new Set(tableRows.map((r) => r.category))];

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        Bảng so sánh chi tiết
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 sticky left-0 bg-slate-800/90 min-w-[180px]">
                Tiêu chí
              </th>
              {selectedBanks.map((bankKey) => {
                const calc = calculations[bankKey];
                if (!calc) return null;
                return (
                  <th
                    key={bankKey}
                    className="text-center py-3 px-4 min-w-[140px]"
                    style={{ color: calc.bank.color }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${calc.bank.color}20` }}
                      >
                        {calc.bank.logo}
                      </span>
                      <span className="truncate">{calc.bank.name}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <Fragment key={category}>
                <tr className="bg-slate-700/30">
                  <td
                    colSpan={selectedBanks.length + 1}
                    className="py-2 px-4 font-semibold text-slate-300 text-xs uppercase tracking-wider"
                  >
                    {category}
                  </td>
                </tr>
                {tableRows
                  .filter((row) => row.category === category)
                  .map((row) => {
                    const bestValue = findBestValue(row.key, row.preferLower);

                    return (
                      <tr
                        key={row.key}
                        className="border-b border-slate-700/30 hover:bg-slate-700/20"
                      >
                        <td className="py-3 px-4 text-slate-400 sticky left-0 bg-slate-800/90">
                          {row.label}
                          {row.unit && (
                            <span className="text-xs text-slate-500 ml-1">
                              ({row.unit})
                            </span>
                          )}
                        </td>
                        {selectedBanks.map((bankKey) => {
                          const calc = calculations[bankKey];
                          if (!calc) return <td key={bankKey}>-</td>;

                          const value = calc[row.key as keyof BankCalculation] as number;
                          const isBest = bestValue !== null && value === bestValue;
                          const isEligible = row.key === 'isEligible' ? calc.isEligible : null;

                          return (
                            <td
                              key={bankKey}
                              className={`py-3 px-4 text-center font-medium ${
                                isBest
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : 'text-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {typeof value === 'number' ? row.format(value) : '-'}
                                {isBest && (
                                  <span className="text-emerald-400 text-xs">✓</span>
                                )}
                                {isEligible !== null && (
                                  <span
                                    className={
                                      isEligible ? 'text-emerald-400' : 'text-red-400'
                                    }
                                  >
                                    {isEligible ? '✓' : '✗'}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
              </Fragment>
            ))}
            {/* Eligibility row */}
            <tr className="bg-slate-700/30">
              <td
                colSpan={selectedBanks.length + 1}
                className="py-2 px-4 font-semibold text-slate-300 text-xs uppercase tracking-wider"
              >
                Điều kiện vay
              </td>
            </tr>
            <tr className="border-b border-slate-700/30">
              <td className="py-3 px-4 text-slate-400 sticky left-0 bg-slate-800/90">
                Đủ điều kiện
              </td>
              {selectedBanks.map((bankKey) => {
                const calc = calculations[bankKey];
                if (!calc) return <td key={bankKey}>-</td>;

                return (
                  <td key={bankKey} className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        calc.isEligible
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {calc.isEligible ? '✓ Đủ' : '✗ Không đủ'}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

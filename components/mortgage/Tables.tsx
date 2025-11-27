'use client';

import type { BankCalculation, BankDataMap, AmortizationEntry } from '@/types/mortgage';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ComparisonTableProps {
  bankData: BankDataMap;
  calculations: Record<string, BankCalculation>;
  selectedBank: string;
  compareBank: string;
}

export function ComparisonTable({
  bankData,
  calculations,
  selectedBank,
  compareBank,
}: ComparisonTableProps) {
  const calc1 = calculations[selectedBank];
  const calc2 = calculations[compareBank];
  const bank1 = bankData[selectedBank];
  const bank2 = bankData[compareBank];

  if (!calc1 || !calc2 || !bank1 || !bank2) return null;

  const rows = [
    { label: 'Lãi suất ưu đãi', key: 'rate', format: (v: number) => `${v.toFixed(2)}%/năm` },
    { label: 'Trả hàng tháng', key: 'monthlyPayment', format: formatCurrency },
    { label: 'Tổng lãi', key: 'totalInterest', format: formatCurrency },
    { label: 'Tổng thanh toán', key: 'totalPayment', format: formatCurrency },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <h4 className="text-lg font-semibold text-slate-300 mb-4">
        So sánh ngân hàng
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400">Tiêu chí</th>
              <th
                className="text-right py-3 px-4"
                style={{ color: bank1.color }}
              >
                {bank1.logo} {bank1.name}
              </th>
              <th
                className="text-right py-3 px-4"
                style={{ color: bank2.color }}
              >
                {bank2.logo} {bank2.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const v1 = calc1[row.key as keyof BankCalculation] as number;
              const v2 = calc2[row.key as keyof BankCalculation] as number;
              const b1Better = v1 < v2;

              return (
                <tr key={row.key} className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-slate-400">{row.label}</td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${
                      b1Better ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {row.format(v1)} {b1Better && '✓'}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${
                      !b1Better ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {row.format(v2)} {!b1Better && '✓'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AmortizationTableProps {
  schedule: AmortizationEntry[];
}

export function AmortizationTable({ schedule }: AmortizationTableProps) {
  // Filter to show monthly for first year, then yearly summaries
  const displaySchedule = schedule.filter((_, i) => i % 12 === 0 || i < 12).slice(0, 40);

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <h4 className="text-lg font-semibold text-slate-300 mb-4">
        Lịch trả nợ
      </h4>
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800">
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-3 text-slate-400">Kỳ</th>
              <th className="text-right py-2 px-3 text-slate-400">LS</th>
              <th className="text-right py-2 px-3 text-slate-400">Thanh toán</th>
              <th className="text-right py-2 px-3 text-slate-400">Gốc</th>
              <th className="text-right py-2 px-3 text-slate-400">Lãi</th>
              <th className="text-right py-2 px-3 text-slate-400">Dư nợ</th>
            </tr>
          </thead>
          <tbody>
            {displaySchedule.map((r, i) => (
              <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="py-2 px-3">
                  {r.month <= 12 ? `T${r.month}` : `N${r.year}`}
                </td>
                <td className="py-2 px-3 text-right">{r.rate.toFixed(2)}%</td>
                <td className="py-2 px-3 text-right text-emerald-400">
                  {formatNumber(r.payment)}
                </td>
                <td className="py-2 px-3 text-right text-blue-400">
                  {formatNumber(r.principal)}
                </td>
                <td className="py-2 px-3 text-right text-amber-400">
                  {formatNumber(r.interest)}
                </td>
                <td className="py-2 px-3 text-right text-slate-300">
                  {formatCurrency(r.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

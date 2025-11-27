'use client';

import type { BankDataMap } from '@/types/mortgage';
import { formatCurrency } from '@/lib/utils';

interface BankListProps {
  bankData: BankDataMap;
  onEdit: (bankKey: string) => void;
  onReset: (bankKey: string) => void;
}

export function BankList({ bankData, onEdit, onReset }: BankListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Thông tin chi tiết các ngân hàng</h2>
        <p className="text-sm text-slate-400">
          Nhấn &quot;Chỉnh sửa&quot; để cập nhật đầy đủ thông tin
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(bankData).map(([key, bank]) => (
          <div
            key={key}
            className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50 hover:border-slate-500 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: `${bank.color}20`, color: bank.color }}
                >
                  {bank.logo}
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: bank.color }}>
                    {bank.name}
                  </h3>
                  <p className="text-sm text-slate-400">{bank.eligibility}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onReset(key)}
                  className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg transition text-white"
                  title="Khôi phục"
                >
                  KP
                </button>
                <button
                  onClick={() => onEdit(key)}
                  className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-lg transition text-white"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">
                  Lãi suất cố định
                </h4>
                <div className="flex flex-wrap gap-2">
                  {bank.interestRates.map((r, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs"
                    >
                      {r.rate}%/{r.months}T
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Sau ưu đãi: {bank.floatingRate}%/năm
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Hạn mức tối đa</p>
                  <p className="font-semibold text-white">
                    {bank.maxLoan > 0 ? formatCurrency(bank.maxLoan) : `${bank.ltvRatio}% TSĐB`}
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Thời hạn tối đa</p>
                  <p className="font-semibold text-white">{bank.maxTerm} năm</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Ân hạn gốc</p>
                  <p className="font-semibold text-amber-400">{bank.maxGraceYears} năm</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">Độ tuổi</p>
                  <p className="font-semibold text-white">
                    {bank.minAge}-{bank.maxAge}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">
                  Phí trả trước hạn
                </h4>
                <div className="flex gap-1">
                  {bank.prepaymentFees.slice(0, 6).map((f, i) => (
                    <div
                      key={i}
                      className={`flex-1 text-center py-2 rounded ${
                        f.fee === 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      <p className="text-xs text-slate-400">N{f.year}</p>
                      <p className="font-bold text-sm">{f.fee}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {bank.specialPrograms?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">CT đặc biệt</h4>
                  {bank.specialPrograms.map((p, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg p-3 border border-emerald-500/20"
                    >
                      <p className="font-semibold text-emerald-400">{p.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{p.benefits}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {bank.specialFeatures?.map((f, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { BankDataMap, BankComparisonSettingsMap } from '@/types/mortgage';

interface BankComparisonSelectorProps {
  bankData: BankDataMap;
  selectedBanks: string[];
  bankSettings: BankComparisonSettingsMap;
  onToggleBank: (bankKey: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onUpdateBankSettings: (bankKey: string, fixedPeriod: number, graceYears: number) => void;
}

export function BankComparisonSelector({
  bankData,
  selectedBanks,
  bankSettings,
  onToggleBank,
  onSelectAll,
  onClearAll,
  onUpdateBankSettings,
}: BankComparisonSelectorProps) {
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const allBankKeys = Object.keys(bankData);
  const allSelected = selectedBanks.length === allBankKeys.length;

  const handleSettingsClick = (e: React.MouseEvent, bankKey: string) => {
    e.stopPropagation();
    setEditingBank(editingBank === bankKey ? null : bankKey);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">
            SS
          </span>
          Chọn ngân hàng
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 rounded-lg transition text-white"
          >
            {allSelected ? 'Tất cả' : 'Chọn hết'}
          </button>
          <button
            onClick={onClearAll}
            className="px-3 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded-lg transition text-white"
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(bankData).map(([key, bank]) => {
          const isSelected = selectedBanks.includes(key);
          const isEditing = editingBank === key;
          const settings = bankSettings[key] || {
            fixedPeriod: bank.interestRates[0]?.months || 12,
            graceYears: 0,
          };

          return (
            <div key={key} className="space-y-0">
              {/* Bank item row */}
              <div
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                } ${isEditing ? 'rounded-b-none' : ''}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => onToggleBank(key)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition flex-shrink-0 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-slate-500 hover:border-slate-400'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>

                {/* Bank logo & name */}
                <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => onToggleBank(key)}>
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: `${bank.color}20`, color: bank.color }}
                  >
                    {bank.logo}
                  </span>
                  <span className="text-sm font-medium truncate">{bank.name}</span>
                </div>

                {/* Current settings preview */}
                {isSelected && (
                  <div className="text-xs text-slate-400 hidden sm:block">
                    {settings.fixedPeriod}T
                    {settings.graceYears > 0 && ` · ÂH${settings.graceYears}N`}
                  </div>
                )}

                {/* Settings button */}
                {isSelected && (
                  <button
                    onClick={(e) => handleSettingsClick(e, key)}
                    className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                      isEditing
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
                    }`}
                    title="Cài đặt ngân hàng"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Settings panel (expanded) */}
              {isEditing && isSelected && (
                <div className="bg-slate-700/50 border border-t-0 border-emerald-500 rounded-b-xl p-3 space-y-3">
                  {/* Fixed period */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Thời gian ưu đãi
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {bank.interestRates.map((rate) => (
                        <button
                          key={rate.months}
                          onClick={() => onUpdateBankSettings(key, rate.months, settings.graceYears)}
                          className={`px-2 py-1 text-xs rounded transition ${
                            settings.fixedPeriod === rate.months
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                          }`}
                        >
                          {rate.months}T ({rate.rate}%)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grace years */}
                  {bank.maxGraceYears > 0 && (
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">
                        Ân hạn gốc (tối đa {bank.maxGraceYears} năm)
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {Array.from({ length: bank.maxGraceYears + 1 }, (_, i) => i).map((year) => (
                          <button
                            key={year}
                            onClick={() => onUpdateBankSettings(key, settings.fixedPeriod, year)}
                            className={`px-2 py-1 text-xs rounded transition ${
                              settings.graceYears === year
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            {year === 0 ? 'Không' : `${year} năm`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bank info preview */}
                  <div className="pt-2 border-t border-slate-600/50 text-xs text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Thời hạn tối đa:</span>
                      <span className="text-white">{bank.maxTerm} năm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lãi suất thả nổi:</span>
                      <span className="text-white">{bank.floatingRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LTV tối đa:</span>
                      <span className="text-white">{bank.ltvRatio}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
        <span>Đã chọn {selectedBanks.length}/{allBankKeys.length}</span>
        <span className="text-slate-500">Nhấn ⚙️ để cài đặt từng NH</span>
      </div>
    </div>
  );
}

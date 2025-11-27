'use client';

import type { BankDataMap } from '@/types/mortgage';

interface BankSelectorProps {
  bankData: BankDataMap;
  selectedBank: string;
  onSelectBank: (bankKey: string) => void;
}

export function BankSelector({
  bankData,
  selectedBank,
  onSelectBank,
}: BankSelectorProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">
          NH
        </span>
        Chọn ngân hàng
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(bankData).map(([key, bank]) => (
          <button
            key={key}
            onClick={() => onSelectBank(key)}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedBank === key
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${bank.color}20`, color: bank.color }}
              >
                {bank.logo}
              </span>
              <span className="text-sm font-medium truncate">{bank.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

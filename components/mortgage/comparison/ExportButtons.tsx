'use client';

import type { BankCalculation } from '@/types/mortgage';
import { exportToExcel, exportSimpleComparison } from '@/lib/excel-export';

interface ExportButtonsProps {
  calculations: Record<string, BankCalculation>;
  selectedBanks: string[];
  loanAmount: number;
  loanTerm: number;
  propertyValue: number;
  age: number;
  income: number;
}

export function ExportButtons({
  calculations,
  selectedBanks,
  loanAmount,
  loanTerm,
  propertyValue,
  age,
  income,
}: ExportButtonsProps) {
  if (selectedBanks.length === 0) {
    return null;
  }

  const handleExportFull = () => {
    exportToExcel({
      calculations,
      selectedBanks,
      loanAmount,
      loanTerm,
      propertyValue,
      age,
      income,
    });
  };

  const handleExportSimple = () => {
    exportSimpleComparison(calculations, selectedBanks);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Xuất báo cáo Excel
      </h4>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportFull}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition text-white font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Xuất báo cáo đầy đủ
        </button>
        <button
          onClick={handleExportSimple}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition text-white font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Xuất so sánh nhanh
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-3">
        <strong>Báo cáo đầy đủ:</strong> Bao gồm tổng hợp, lịch trả nợ, chi tiết ngân hàng, phí trả trước hạn
        <br />
        <strong>So sánh nhanh:</strong> Chỉ bao gồm bảng so sánh cơ bản
      </p>
    </div>
  );
}

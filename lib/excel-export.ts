import * as XLSX from 'xlsx';
import type { BankCalculation } from '@/types/mortgage';
import { formatNumber } from './utils';

interface ExportOptions {
  calculations: Record<string, BankCalculation>;
  selectedBanks: string[];
  loanAmount: number;
  loanTerm: number;
  propertyValue: number;
  age: number;
  income: number;
}

interface RowData {
  category: string;
  label: string;
  key: keyof BankCalculation | string;
  format: (value: number) => string;
  preferLower: boolean;
}

const exportRows: RowData[] = [
  { category: 'Thông tin chung', label: 'Ngân hàng', key: 'bankName', format: (v) => String(v), preferLower: false },
  { category: 'Thông tin chung', label: 'Đối tượng vay', key: 'eligibility', format: (v) => String(v), preferLower: false },

  { category: 'Lãi suất', label: 'Lãi suất ưu đãi (%/năm)', key: 'rate', format: (v) => v.toFixed(2), preferLower: true },
  { category: 'Lãi suất', label: 'Lãi suất thả nổi (%/năm)', key: 'floatingRate', format: (v) => v.toFixed(2), preferLower: true },
  { category: 'Lãi suất', label: 'Lãi suất hiệu dụng (%/năm)', key: 'effectiveRate', format: (v) => v.toFixed(2), preferLower: true },

  { category: 'Thanh toán', label: 'Trả hàng tháng (VNĐ)', key: 'monthlyPayment', format: formatNumber, preferLower: true },
  { category: 'Thanh toán', label: 'Tổng lãi phải trả (VNĐ)', key: 'totalInterest', format: formatNumber, preferLower: true },
  { category: 'Thanh toán', label: 'Tổng thanh toán (VNĐ)', key: 'totalPayment', format: formatNumber, preferLower: true },

  { category: 'Đánh giá', label: 'Tỷ lệ DTI (%)', key: 'dti', format: (v) => v.toFixed(1), preferLower: true },
  { category: 'Đánh giá', label: 'Đủ điều kiện vay', key: 'isEligible', format: (v) => v ? 'Có' : 'Không', preferLower: false },

  { category: 'Trả trước hạn', label: 'Lãi tiết kiệm (VNĐ)', key: 'interestSaved', format: formatNumber, preferLower: false },
  { category: 'Trả trước hạn', label: 'Phí phạt (VNĐ)', key: 'prepaymentFees', format: formatNumber, preferLower: true },
  { category: 'Trả trước hạn', label: 'Lợi ích ròng (VNĐ)', key: 'netBenefit', format: formatNumber, preferLower: false },
  { category: 'Trả trước hạn', label: 'Rút ngắn thời hạn', key: 'termSaved', format: (v) => `${Math.floor(v / 12)} năm ${v % 12} tháng`, preferLower: false },
];

export function exportToExcel(options: ExportOptions): void {
  const { calculations, selectedBanks, loanAmount, loanTerm, propertyValue, age, income } = options;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // ===== Sheet 1: Summary =====
  const summaryData: (string | number)[][] = [
    ['BÁO CÁO SO SÁNH VAY MUA NHÀ'],
    ['Ngày xuất:', new Date().toLocaleDateString('vi-VN')],
    [],
    ['THÔNG TIN KHOẢN VAY'],
    ['Giá trị BĐS:', formatNumber(propertyValue) + ' VNĐ'],
    ['Số tiền vay:', formatNumber(loanAmount) + ' VNĐ'],
    ['Thời hạn vay:', `${loanTerm} năm`],
    ['Tuổi người vay:', `${age} tuổi`],
    ['Thu nhập hàng tháng:', formatNumber(income) + ' VNĐ'],
    [],
  ];

  // Add comparison header
  const headerRow = ['Tiêu chí', ...selectedBanks.map((k) => calculations[k]?.bank.name || k)];
  summaryData.push(headerRow);

  // Find best values for highlighting
  const bestValues: Record<string, { value: number; bankKey: string }> = {};

  exportRows.forEach((row) => {
    if (row.key === 'bankName' || row.key === 'eligibility' || row.key === 'isEligible') return;

    let best: { value: number; bankKey: string } | null = null;
    selectedBanks.forEach((bankKey) => {
      const calc = calculations[bankKey];
      if (!calc) return;

      const value = calc[row.key as keyof BankCalculation] as number;
      if (typeof value !== 'number') return;

      if (best === null || (row.preferLower ? value < best.value : value > best.value)) {
        best = { value, bankKey };
      }
    });

    if (best) {
      bestValues[row.key] = best;
    }
  });

  // Add data rows
  let currentCategory = '';
  exportRows.forEach((row) => {
    if (row.category !== currentCategory) {
      summaryData.push([]);
      summaryData.push([row.category.toUpperCase()]);
      currentCategory = row.category;
    }

    const dataRow: (string | number)[] = [row.label];

    selectedBanks.forEach((bankKey) => {
      const calc = calculations[bankKey];
      if (!calc) {
        dataRow.push('-');
        return;
      }

      let value: string | number | boolean;
      if (row.key === 'bankName') {
        value = calc.bank.name;
      } else if (row.key === 'eligibility') {
        value = calc.bank.eligibility;
      } else {
        value = calc[row.key as keyof BankCalculation] as number | boolean;
      }

      if (typeof value === 'boolean') {
        dataRow.push(value ? 'Có' : 'Không');
      } else if (typeof value === 'number') {
        const formattedValue = row.format(value);
        const isBest = bestValues[row.key]?.bankKey === bankKey;
        dataRow.push(isBest ? `★ ${formattedValue}` : formattedValue);
      } else {
        dataRow.push(String(value));
      }
    });

    summaryData.push(dataRow);
  });

  // Add notes
  summaryData.push([]);
  summaryData.push(['GHI CHÚ:']);
  summaryData.push(['★ Giá trị tốt nhất trong các ngân hàng được so sánh']);
  summaryData.push([]);
  summaryData.push(['Công cụ chỉ mang tính chất tham khảo. Vui lòng liên hệ ngân hàng để được tư vấn chi tiết.']);

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths
  ws1['!cols'] = [
    { wch: 30 }, // Label column
    ...selectedBanks.map(() => ({ wch: 20 })),
  ];

  // Style the header (note: xlsx doesn't support full styling in basic mode, but we can at least set widths)
  XLSX.utils.book_append_sheet(wb, ws1, 'Tổng hợp');

  // ===== Sheet 2: Amortization Schedules =====
  selectedBanks.forEach((bankKey) => {
    const calc = calculations[bankKey];
    if (!calc || !calc.scheduleNormal) return;

    const scheduleData: (string | number)[][] = [
      [`LỊCH TRẢ NỢ - ${calc.bank.name}`],
      [],
      ['Kỳ', 'Năm', 'Lãi suất (%)', 'Thanh toán', 'Gốc', 'Lãi', 'Dư nợ', 'Tổng lãi đã trả'],
    ];

    calc.scheduleNormal.forEach((entry) => {
      scheduleData.push([
        entry.month,
        entry.year,
        entry.rate.toFixed(2),
        Math.round(entry.payment),
        Math.round(entry.principal),
        Math.round(entry.interest),
        Math.round(entry.balance),
        Math.round(entry.totalInterest),
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(scheduleData);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 8 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 },
    ];

    // Truncate sheet name to 31 chars (Excel limit)
    const sheetName = `Lịch trả nợ - ${calc.bank.name}`.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // ===== Sheet 3: Bank Details =====
  const bankDetailsData: (string | number)[][] = [
    ['THÔNG TIN CHI TIẾT NGÂN HÀNG'],
    [],
    [
      'Ngân hàng',
      'LTV tối đa (%)',
      'Thời hạn tối đa (năm)',
      'Ân hạn gốc tối đa (năm)',
      'Tuổi tối thiểu',
      'Tuổi tối đa',
      'Thu nhập tối thiểu',
      'Đặc điểm nổi bật',
    ],
  ];

  selectedBanks.forEach((bankKey) => {
    const calc = calculations[bankKey];
    if (!calc) return;
    const bank = calc.bank;

    bankDetailsData.push([
      bank.name,
      bank.ltvRatio,
      bank.maxTerm,
      bank.maxGraceYears,
      bank.minAge,
      bank.maxAge,
      formatNumber(bank.minIncome),
      bank.specialFeatures?.join(', ') || '',
    ]);
  });

  const ws3 = XLSX.utils.aoa_to_sheet(bankDetailsData);
  ws3['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'Chi tiết ngân hàng');

  // ===== Sheet 4: Prepayment Fees =====
  const prepaymentData: (string | number)[][] = [
    ['PHÍ TRẢ TRƯỚC HẠN (%)'],
    [],
    ['Ngân hàng', 'Năm 1', 'Năm 2', 'Năm 3', 'Năm 4', 'Năm 5', 'Năm 6+'],
  ];

  selectedBanks.forEach((bankKey) => {
    const calc = calculations[bankKey];
    if (!calc) return;
    const bank = calc.bank;

    const row: (string | number)[] = [bank.name];
    for (let i = 0; i < 6; i++) {
      const fee = bank.prepaymentFees.find((f) => f.year === i + 1);
      row.push(fee ? fee.fee : '-');
    }
    prepaymentData.push(row);
  });

  const ws4 = XLSX.utils.aoa_to_sheet(prepaymentData);
  ws4['!cols'] = [
    { wch: 15 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws4, 'Phí trả trước hạn');

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `So_sanh_vay_${timestamp}.xlsx`;

  // Download
  XLSX.writeFile(wb, filename);
}

export function exportSimpleComparison(
  calculations: Record<string, BankCalculation>,
  selectedBanks: string[]
): void {
  const wb = XLSX.utils.book_new();

  const data: (string | number)[][] = [
    ['SO SÁNH NHANH NGÂN HÀNG'],
    ['Ngày xuất:', new Date().toLocaleDateString('vi-VN')],
    [],
    [
      'Ngân hàng',
      'Lãi suất (%)',
      'Trả/tháng',
      'Tổng lãi',
      'Tổng thanh toán',
      'DTI (%)',
      'Đủ điều kiện',
    ],
  ];

  selectedBanks.forEach((bankKey) => {
    const calc = calculations[bankKey];
    if (!calc) return;

    data.push([
      calc.bank.name,
      calc.rate.toFixed(2),
      Math.round(calc.monthlyPayment),
      Math.round(calc.totalInterest),
      Math.round(calc.totalPayment),
      calc.dti.toFixed(1),
      calc.isEligible ? 'Có' : 'Không',
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 10 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'So sánh');

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `So_sanh_nhanh_${timestamp}.xlsx`);
}

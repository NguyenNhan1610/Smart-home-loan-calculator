'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { BankDataMap, CalculationResults, ChartDataPoint, PaymentBreakdown, BankComparisonSettingsMap } from '@/types/mortgage';
import {
  calculateAmortization,
  calculatePrepaymentFee,
  calculateEffectiveRate,
  calculateDTI,
  calculateEffectiveAnnualRate,
  checkEligibility,
} from '@/lib/finance';
import {
  BankSelector,
  PersonalInfo,
  LoanDetails,
  PrepaymentOptions,
  ResultsSummary,
  PrepaymentAnalysis,
  BalanceChart,
  PaymentPieChart,
  AmortizationTable,
  BankEditor,
  BankList,
  Formulas,
} from '@/components/mortgage';
import {
  BankComparisonSelector,
  ComparisonInputs,
  ComparisonSummaryCards,
  DetailedComparisonTable,
  ComparisonCharts,
  ExportButtons,
} from '@/components/mortgage/comparison';

type ActiveTab = 'calculator' | 'compare' | 'banks' | 'formulas';

export default function MortgagePage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  // Bank data state
  const [bankData, setBankData] = useState<BankDataMap>({});
  const [initialBankData, setInitialBankData] = useState<BankDataMap>({});
  const [editingBank, setEditingBank] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [dataLoading, setDataLoading] = useState(true);

  // Calculator inputs
  const [age, setAge] = useState(28);
  const [income, setIncome] = useState(30000000);
  const [propertyValue, setPropertyValue] = useState(3000000000);
  const [loanAmount, setLoanAmount] = useState(2000000000);
  const [loanTerm, setLoanTerm] = useState(20);
  const [graceYears, setGraceYears] = useState(0);
  const [fixedPeriod, setFixedPeriod] = useState(24);
  const [enablePrepayment, setEnablePrepayment] = useState(false);
  const [extraPayment, setExtraPayment] = useState(100000000);
  const [startExtraYear, setStartExtraYear] = useState(3);
  const [extraYears, setExtraYears] = useState(5);
  const [isProject, setIsProject] = useState(false);
  const [isRefinance, setIsRefinance] = useState(false);
  const [selectedBank, setSelectedBank] = useState('vietcombank');
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');

  // Multi-bank comparison state
  const [selectedBanksForComparison, setSelectedBanksForComparison] = useState<string[]>([]);
  const [bankComparisonSettings, setBankComparisonSettings] = useState<BankComparisonSettingsMap>({});

  const currentBank = bankData[selectedBank];
  const availableRates = currentBank?.interestRates || [];

  // Load bank data
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/banks');
        const data: BankDataMap = await response.json();
        setBankData(data);
        setInitialBankData(data);
        // Select all banks by default for comparison
        setSelectedBanksForComparison(Object.keys(data));
        // Initialize bank comparison settings with defaults
        const initialSettings: BankComparisonSettingsMap = {};
        Object.entries(data).forEach(([key, bank]) => {
          initialSettings[key] = {
            fixedPeriod: bank.interestRates[0]?.months || 12,
            graceYears: 0,
          };
        });
        setBankComparisonSettings(initialSettings);
      } catch (error) {
        console.error('Failed to load bank data:', error);
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Adjust inputs when bank changes
  useEffect(() => {
    if (currentBank) {
      if (graceYears > currentBank.maxGraceYears) {
        setGraceYears(currentBank.maxGraceYears);
      }
      if (!currentBank.interestRates.find((r) => r.months === fixedPeriod)) {
        setFixedPeriod(currentBank.interestRates[0]?.months || 12);
      }
      if (loanTerm > currentBank.maxTerm) {
        setLoanTerm(currentBank.maxTerm);
      }
    }
  }, [selectedBank, currentBank, graceYears, fixedPeriod, loanTerm]);

  // Save bank data
  const handleSaveBank = useCallback(async (key: string, data: BankDataMap[string]) => {
    try {
      const response = await fetch('/api/banks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankKey: key, data }),
      });

      if (response.ok) {
        setBankData((prev) => ({ ...prev, [key]: data }));
        setEditingBank(null);
        setSaveMsg(`Đã lưu ${data.name}`);
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save bank:', error);
    }
  }, []);

  // Reset bank data
  const handleResetBank = useCallback((key: string) => {
    if (confirm(`Khôi phục ${bankData[key]?.name} về mặc định?`)) {
      const originalData = initialBankData[key];
      if (originalData) {
        setBankData((prev) => ({ ...prev, [key]: originalData }));
        setSaveMsg(`Đã khôi phục ${originalData.name}`);
        setTimeout(() => setSaveMsg(''), 3000);
      }
    }
  }, [bankData, initialBankData]);

  // Toggle bank for comparison
  const handleToggleBankForComparison = useCallback((bankKey: string) => {
    setSelectedBanksForComparison((prev) =>
      prev.includes(bankKey)
        ? prev.filter((k) => k !== bankKey)
        : [...prev, bankKey]
    );
  }, []);

  // Select all banks for comparison
  const handleSelectAllBanks = useCallback(() => {
    setSelectedBanksForComparison(Object.keys(bankData));
  }, [bankData]);

  // Clear all banks for comparison
  const handleClearAllBanks = useCallback(() => {
    setSelectedBanksForComparison([]);
  }, []);

  // Update bank comparison settings
  const handleUpdateBankSettings = useCallback((bankKey: string, fixedPeriod: number, graceYears: number) => {
    setBankComparisonSettings((prev) => ({
      ...prev,
      [bankKey]: { fixedPeriod, graceYears },
    }));
  }, []);

  // Calculator calculations (for single bank view)
  const calculations = useMemo<CalculationResults>(() => {
    const results: CalculationResults = {};

    for (const bankKey of [selectedBank]) {
      const bank = bankData[bankKey];
      if (!bank) continue;

      // Get base rate
      const rateOpt = bank.interestRates.find((r) => r.months === fixedPeriod) ||
                      bank.interestRates[bank.interestRates.length - 1];
      let rate = rateOpt?.rate || 6;

      // Apply discounts
      rate = calculateEffectiveRate(bank, rate, age, graceYears, isProject, isRefinance);

      // Apply young customer rates
      if (age <= 35 && bank.youngRates) {
        const youngRate = bank.youngRates.find((r) => r.months <= fixedPeriod);
        if (youngRate) {
          rate = Math.min(rate, youngRate.rate);
        }
      }

      const totalMonths = loanTerm * 12;
      const fixedMonths = fixedPeriod;
      const graceMonths = graceYears * 12;

      // Calculate normal schedule
      const scheduleNormal = calculateAmortization(
        loanAmount,
        rate,
        bank.floatingRate,
        fixedMonths,
        totalMonths,
        graceMonths,
        0,
        0
      );

      // Calculate prepayment schedule if enabled
      let schedulePrepay = scheduleNormal;
      let prepayFees = 0;
      let interestSaved = 0;

      if (enablePrepayment) {
        schedulePrepay = calculateAmortization(
          loanAmount,
          rate,
          bank.floatingRate,
          fixedMonths,
          totalMonths,
          graceMonths,
          extraPayment,
          startExtraYear
        );

        // Calculate prepayment fees
        for (
          let y = startExtraYear;
          y < startExtraYear + extraYears && y <= Math.ceil(schedulePrepay.length / 12);
          y++
        ) {
          prepayFees += calculatePrepaymentFee(bank.prepaymentFees, y, extraPayment);
        }

        // Calculate interest saved
        interestSaved =
          (scheduleNormal[scheduleNormal.length - 1]?.totalInterest || 0) -
          (schedulePrepay[schedulePrepay.length - 1]?.totalInterest || 0);
      }

      const monthlyPayment = scheduleNormal[graceMonths]?.payment || scheduleNormal[0]?.payment || 0;
      const totalPayment = scheduleNormal.reduce((s, r) => s + r.payment, 0);
      const totalInterest = scheduleNormal[scheduleNormal.length - 1]?.totalInterest || 0;

      results[bankKey] = {
        bank,
        rate,
        floatingRate: bank.floatingRate,
        scheduleNormal,
        schedulePrepay: enablePrepayment ? schedulePrepay : null,
        monthlyPayment,
        totalInterest,
        totalPayment,
        dti: calculateDTI(monthlyPayment, income),
        effectiveRate: calculateEffectiveAnnualRate(totalPayment, loanAmount, loanTerm),
        prepaymentFees: prepayFees,
        interestSaved,
        netBenefit: interestSaved - prepayFees,
        termSaved: enablePrepayment ? scheduleNormal.length - schedulePrepay.length : 0,
        isEligible: checkEligibility(bank, age, income),
      };
    }

    return results;
  }, [
    bankData,
    selectedBank,
    age,
    income,
    loanAmount,
    loanTerm,
    graceYears,
    fixedPeriod,
    enablePrepayment,
    extraPayment,
    startExtraYear,
    extraYears,
    isProject,
    isRefinance,
  ]);

  // Multi-bank comparison calculations
  const comparisonCalculations = useMemo<CalculationResults>(() => {
    const results: CalculationResults = {};

    for (const bankKey of selectedBanksForComparison) {
      const bank = bankData[bankKey];
      if (!bank) continue;

      // Get per-bank settings or defaults
      const settings = bankComparisonSettings[bankKey] || {
        fixedPeriod: bank.interestRates[0]?.months || 12,
        graceYears: 0,
      };

      // Use the bank's fixed period from settings
      const bankFixedPeriod = settings.fixedPeriod;

      // Get base rate
      const rateOpt = bank.interestRates.find((r) => r.months === bankFixedPeriod) ||
                      bank.interestRates[bank.interestRates.length - 1];
      let rate = rateOpt?.rate || 6;

      // Apply discounts (use per-bank grace years)
      rate = calculateEffectiveRate(bank, rate, age, settings.graceYears, isProject, isRefinance);

      // Apply young customer rates
      if (age <= 35 && bank.youngRates) {
        const youngRate = bank.youngRates.find((r) => r.months <= bankFixedPeriod);
        if (youngRate) {
          rate = Math.min(rate, youngRate.rate);
        }
      }

      // Use bank's max term if loan term exceeds it
      const bankLoanTerm = Math.min(loanTerm, bank.maxTerm);
      const bankGraceYears = Math.min(settings.graceYears, bank.maxGraceYears);

      const totalMonths = bankLoanTerm * 12;
      const fixedMonths = bankFixedPeriod;
      const graceMonths = bankGraceYears * 12;

      // Calculate normal schedule
      const scheduleNormal = calculateAmortization(
        loanAmount,
        rate,
        bank.floatingRate,
        fixedMonths,
        totalMonths,
        graceMonths,
        0,
        0
      );

      // Calculate prepayment schedule if enabled
      let schedulePrepay = scheduleNormal;
      let prepayFees = 0;
      let interestSaved = 0;

      if (enablePrepayment) {
        schedulePrepay = calculateAmortization(
          loanAmount,
          rate,
          bank.floatingRate,
          fixedMonths,
          totalMonths,
          graceMonths,
          extraPayment,
          startExtraYear
        );

        // Calculate prepayment fees
        for (
          let y = startExtraYear;
          y < startExtraYear + extraYears && y <= Math.ceil(schedulePrepay.length / 12);
          y++
        ) {
          prepayFees += calculatePrepaymentFee(bank.prepaymentFees, y, extraPayment);
        }

        // Calculate interest saved
        interestSaved =
          (scheduleNormal[scheduleNormal.length - 1]?.totalInterest || 0) -
          (schedulePrepay[schedulePrepay.length - 1]?.totalInterest || 0);
      }

      const monthlyPayment = scheduleNormal[graceMonths]?.payment || scheduleNormal[0]?.payment || 0;
      const totalPayment = scheduleNormal.reduce((s, r) => s + r.payment, 0);
      const totalInterest = scheduleNormal[scheduleNormal.length - 1]?.totalInterest || 0;

      results[bankKey] = {
        bank,
        rate,
        floatingRate: bank.floatingRate,
        scheduleNormal,
        schedulePrepay: enablePrepayment ? schedulePrepay : null,
        monthlyPayment,
        totalInterest,
        totalPayment,
        dti: calculateDTI(monthlyPayment, income),
        effectiveRate: calculateEffectiveAnnualRate(totalPayment, loanAmount, bankLoanTerm),
        prepaymentFees: prepayFees,
        interestSaved,
        netBenefit: interestSaved - prepayFees,
        termSaved: enablePrepayment ? scheduleNormal.length - schedulePrepay.length : 0,
        isEligible: checkEligibility(bank, age, income),
      };
    }

    return results;
  }, [
    bankData,
    selectedBanksForComparison,
    bankComparisonSettings,
    age,
    income,
    loanAmount,
    loanTerm,
    enablePrepayment,
    extraPayment,
    startExtraYear,
    extraYears,
    isProject,
    isRefinance,
  ]);

  // Chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const calc = calculations[selectedBank];
    if (!calc) return [];

    const sched = enablePrepayment && calc.schedulePrepay ? calc.schedulePrepay : calc.scheduleNormal;
    const norm = calc.scheduleNormal;
    const data: ChartDataPoint[] = [];

    for (let i = 0; i < Math.max(sched.length, norm.length); i += 12) {
      data.push({
        year: `Năm ${Math.floor(i / 12) + 1}`,
        'Dư nợ (Chuẩn)': norm[i]?.balance || 0,
        'Dư nợ (Trả trước)': sched[i]?.balance || 0,
      });
    }

    return data;
  }, [calculations, selectedBank, enablePrepayment]);

  // Payment breakdown
  const paymentBreakdown = useMemo<PaymentBreakdown[]>(() => {
    const calc = calculations[selectedBank];
    if (!calc) return [];

    return [
      { name: 'Gốc', value: loanAmount, color: '#10B981' },
      { name: 'Lãi', value: calc.totalInterest, color: '#F59E0B' },
    ];
  }, [calculations, selectedBank, loanAmount]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // Input components for both calculator and comparison tabs
  const renderInputs = (showBankSelector: boolean = true) => (
    <>
      <PersonalInfo
        age={age}
        income={income}
        onAgeChange={setAge}
        onIncomeChange={setIncome}
      />

      {showBankSelector && (
        <BankSelector
          bankData={bankData}
          selectedBank={selectedBank}
          onSelectBank={setSelectedBank}
        />
      )}

      <LoanDetails
        currentBank={showBankSelector ? currentBank : bankData[Object.keys(bankData)[0]]}
        propertyValue={propertyValue}
        loanAmount={loanAmount}
        loanTerm={loanTerm}
        graceYears={graceYears}
        fixedPeriod={fixedPeriod}
        availableRates={showBankSelector ? availableRates : bankData[Object.keys(bankData)[0]]?.interestRates || []}
        onPropertyValueChange={setPropertyValue}
        onLoanAmountChange={setLoanAmount}
        onLoanTermChange={setLoanTerm}
        onGraceYearsChange={setGraceYears}
        onFixedPeriodChange={setFixedPeriod}
      />

      <PrepaymentOptions
        enablePrepayment={enablePrepayment}
        extraPayment={extraPayment}
        startExtraYear={startExtraYear}
        extraYears={extraYears}
        onEnablePrepaymentChange={setEnablePrepayment}
        onExtraPaymentChange={setExtraPayment}
        onStartExtraYearChange={setStartExtraYear}
        onExtraYearsChange={setExtraYears}
      />

      {/* Additional options */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-sm">
            ĐK
          </span>
          Điều kiện bổ sung
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isProject}
              onChange={(e) => setIsProject(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span className="text-sm text-slate-300">Mua nhà dự án liên kết</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRefinance}
              onChange={(e) => setIsRefinance(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span className="text-sm text-slate-300">Trả nợ trước hạn từ NH khác</span>
          </label>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Save message toast */}
      {saveMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
          {saveMsg}
        </div>
      )}

      {/* Bank editor modal */}
      {editingBank && bankData[editingBank] && (
        <BankEditor
          bank={bankData[editingBank]}
          bankKey={editingBank}
          onSave={handleSaveBank}
          onCancel={() => setEditingBank(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-[1680px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/20">
              MC
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Mortgage Calculator Pro
              </h1>
              <p className="text-xs text-slate-400">Công cụ tính toán vay mua nhà thông minh</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex gap-1 bg-slate-800/50 p-1 rounded-xl">
              {[
                { id: 'calculator' as const, label: 'Tính toán' },
                { id: 'compare' as const, label: 'So sánh' },
                { id: 'banks' as const, label: 'Ngân hàng' },
                { id: 'formulas' as const, label: 'Công thức' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === t.id
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1680px] mx-auto px-4 py-6">
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar - inputs */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {renderInputs(true)}
            </div>

            {/* Right content - results */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <ResultsSummary calculation={calculations[selectedBank]} />

              {enablePrepayment && calculations[selectedBank] && (
                <PrepaymentAnalysis calculation={calculations[selectedBank]} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BalanceChart data={chartData} enablePrepayment={enablePrepayment} />
                <PaymentPieChart data={paymentBreakdown} />
              </div>

              {calculations[selectedBank]?.scheduleNormal && (
                <AmortizationTable schedule={calculations[selectedBank].scheduleNormal} />
              )}
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar - inputs & bank selector */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              <ComparisonInputs
                age={age}
                income={income}
                onAgeChange={setAge}
                onIncomeChange={setIncome}
                propertyValue={propertyValue}
                loanAmount={loanAmount}
                loanTerm={loanTerm}
                onPropertyValueChange={setPropertyValue}
                onLoanAmountChange={setLoanAmount}
                onLoanTermChange={setLoanTerm}
                isProject={isProject}
                isRefinance={isRefinance}
                onIsProjectChange={setIsProject}
                onIsRefinanceChange={setIsRefinance}
                enablePrepayment={enablePrepayment}
                extraPayment={extraPayment}
                startExtraYear={startExtraYear}
                onEnablePrepaymentChange={setEnablePrepayment}
                onExtraPaymentChange={setExtraPayment}
                onStartExtraYearChange={setStartExtraYear}
              />

              <BankComparisonSelector
                bankData={bankData}
                selectedBanks={selectedBanksForComparison}
                bankSettings={bankComparisonSettings}
                onToggleBank={handleToggleBankForComparison}
                onSelectAll={handleSelectAllBanks}
                onClearAll={handleClearAllBanks}
                onUpdateBankSettings={handleUpdateBankSettings}
              />
            </div>

            {/* Right content - comparison results */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              <ComparisonSummaryCards
                calculations={comparisonCalculations}
                selectedBanks={selectedBanksForComparison}
              />

              <DetailedComparisonTable
                calculations={comparisonCalculations}
                selectedBanks={selectedBanksForComparison}
              />

              <ComparisonCharts
                calculations={comparisonCalculations}
                selectedBanks={selectedBanksForComparison}
              />

              <ExportButtons
                calculations={comparisonCalculations}
                selectedBanks={selectedBanksForComparison}
                loanAmount={loanAmount}
                loanTerm={loanTerm}
                propertyValue={propertyValue}
                age={age}
                income={income}
              />
            </div>
          </div>
        )}

        {activeTab === 'banks' && (
          <BankList
            bankData={bankData}
            onEdit={setEditingBank}
            onReset={handleResetBank}
          />
        )}

        {activeTab === 'formulas' && <Formulas />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12 py-6">
        <div className="max-w-[1680px] mx-auto px-4 text-center text-sm text-slate-500">
          <p>
            Công cụ chỉ mang tính chất tham khảo. Vui lòng liên hệ ngân hàng để được tư vấn chi tiết.
          </p>
        </div>
      </footer>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

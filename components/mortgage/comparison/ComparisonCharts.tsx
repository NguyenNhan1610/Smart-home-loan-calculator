'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import type { BankCalculation } from '@/types/mortgage';
import { formatNumber } from '@/lib/utils';

interface ComparisonChartsProps {
  calculations: Record<string, BankCalculation>;
  selectedBanks: string[];
}

export function ComparisonCharts({
  calculations,
  selectedBanks,
}: ComparisonChartsProps) {
  if (selectedBanks.length === 0) {
    return null;
  }

  // Prepare data for monthly payment chart
  const monthlyPaymentData = selectedBanks
    .map((bankKey) => {
      const calc = calculations[bankKey];
      if (!calc) return null;
      return {
        name: calc.bank.name,
        value: calc.monthlyPayment,
        color: calc.bank.color,
        logo: calc.bank.logo,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a?.value || 0) - (b?.value || 0));

  // Prepare data for total interest chart
  const totalInterestData = selectedBanks
    .map((bankKey) => {
      const calc = calculations[bankKey];
      if (!calc) return null;
      return {
        name: calc.bank.name,
        value: calc.totalInterest,
        color: calc.bank.color,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a?.value || 0) - (b?.value || 0));

  // Prepare data for interest rate chart
  const rateData = selectedBanks
    .map((bankKey) => {
      const calc = calculations[bankKey];
      if (!calc) return null;
      return {
        name: calc.bank.name,
        'LS ưu đãi': calc.rate,
        'LS thả nổi': calc.floatingRate,
        color: calc.bank.color,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a?.['LS ưu đãi'] || 0) - (b?.['LS ưu đãi'] || 0));

  // Prepare radar chart data (normalized scores 0-100)
  const maxValues = {
    rate: Math.max(...selectedBanks.map((k) => calculations[k]?.rate || 0)),
    monthlyPayment: Math.max(
      ...selectedBanks.map((k) => calculations[k]?.monthlyPayment || 0)
    ),
    totalInterest: Math.max(
      ...selectedBanks.map((k) => calculations[k]?.totalInterest || 0)
    ),
    dti: Math.max(...selectedBanks.map((k) => calculations[k]?.dti || 0)),
    effectiveRate: Math.max(
      ...selectedBanks.map((k) => calculations[k]?.effectiveRate || 0)
    ),
  };

  const radarData = [
    { metric: 'Lãi suất', fullMark: 100 },
    { metric: 'Thanh toán/tháng', fullMark: 100 },
    { metric: 'Tổng lãi', fullMark: 100 },
    { metric: 'DTI', fullMark: 100 },
    { metric: 'LS hiệu dụng', fullMark: 100 },
  ].map((item) => {
    const result: Record<string, number | string> = { ...item };
    selectedBanks.forEach((bankKey) => {
      const calc = calculations[bankKey];
      if (!calc) return;

      // Lower is better, so invert the score
      let score = 0;
      switch (item.metric) {
        case 'Lãi suất':
          score = maxValues.rate > 0 ? (1 - calc.rate / maxValues.rate) * 100 : 100;
          break;
        case 'Thanh toán/tháng':
          score =
            maxValues.monthlyPayment > 0
              ? (1 - calc.monthlyPayment / maxValues.monthlyPayment) * 100
              : 100;
          break;
        case 'Tổng lãi':
          score =
            maxValues.totalInterest > 0
              ? (1 - calc.totalInterest / maxValues.totalInterest) * 100
              : 100;
          break;
        case 'DTI':
          score = maxValues.dti > 0 ? (1 - calc.dti / maxValues.dti) * 100 : 100;
          break;
        case 'LS hiệu dụng':
          score =
            maxValues.effectiveRate > 0
              ? (1 - calc.effectiveRate / maxValues.effectiveRate) * 100
              : 100;
          break;
      }
      result[calc.bank.name] = Math.round(score);
    });
    return result;
  });

  return (
    <div className="space-y-6">
      {/* Monthly Payment Bar Chart */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          So sánh trả hàng tháng
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPaymentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                tickFormatter={(v) => formatNumber(v)}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatNumber(value), 'VNĐ/tháng']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {monthlyPaymentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry?.color || '#10B981'}
                    fillOpacity={index === 0 ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Total Interest Bar Chart */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          So sánh tổng lãi phải trả
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={totalInterestData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                tickFormatter={(v) => formatNumber(v)}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9CA3AF"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatNumber(value), 'VNĐ']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {totalInterestData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry?.color || '#F59E0B'}
                    fillOpacity={index === 0 ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interest Rate Comparison */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
          So sánh lãi suất
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
              />
              <Legend />
              <Bar dataKey="LS ưu đãi" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="LS thả nổi" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart - Overall Comparison */}
      {selectedBanks.length >= 2 && selectedBanks.length <= 5 && (
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Đánh giá tổng quan (điểm càng cao càng tốt)
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" fontSize={12} />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  stroke="#9CA3AF"
                  fontSize={10}
                />
                {selectedBanks.map((bankKey) => {
                  const calc = calculations[bankKey];
                  if (!calc) return null;
                  return (
                    <Radar
                      key={bankKey}
                      name={calc.bank.name}
                      dataKey={calc.bank.name}
                      stroke={calc.bank.color}
                      fill={calc.bank.color}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  );
                })}
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">
            * Điểm được tính dựa trên so sánh tương đối giữa các ngân hàng đã chọn
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import type { ChartDataPoint, PaymentBreakdown } from '@/types/mortgage';
import { formatCurrency } from '@/lib/utils';

interface BalanceChartProps {
  data: ChartDataPoint[];
  enablePrepayment: boolean;
}

export function BalanceChart({ data, enablePrepayment }: BalanceChartProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <h4 className="text-sm font-semibold text-slate-300 mb-4">
        Biến động dư nợ
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPrepay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="year" stroke="#9CA3AF" fontSize={10} />
          <YAxis
            stroke="#9CA3AF"
            fontSize={10}
            tickFormatter={(v) => `${(v / 1e9).toFixed(1)}B`}
          />
          <Tooltip
            contentStyle={{
              background: '#1F2937',
              border: 'none',
              borderRadius: '8px',
            }}
            formatter={(v: number) => formatCurrency(v)}
          />
          <Area
            type="monotone"
            dataKey="Dư nợ (Chuẩn)"
            stroke="#3B82F6"
            fill="url(#colorNormal)"
          />
          {enablePrepayment && (
            <Area
              type="monotone"
              dataKey="Dư nợ (Trả trước)"
              stroke="#10B981"
              fill="url(#colorPrepay)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PaymentPieChartProps {
  data: PaymentBreakdown[];
}

export function PaymentPieChart({ data }: PaymentPieChartProps) {
  // Transform data to be compatible with recharts
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.value,
    fill: item.color,
  }));

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
      <h4 className="text-sm font-semibold text-slate-300 mb-4">
        Cơ cấu thanh toán
      </h4>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1F2937',
              border: 'none',
              borderRadius: '8px',
            }}
            formatter={(v: number) => formatCurrency(v)}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

const formulas = [
  {
    title: '1. Tiền trả hàng tháng (PMT)',
    formula: 'PMT = P x [r(1+r)^n] / [(1+r)^n - 1]',
    vars: ['P: Số tiền vay', 'r: Lãi suất tháng', 'n: Số kỳ trả'],
  },
  {
    title: '2. Phí phạt trả trước hạn',
    formula: 'Phí = Tỷ lệ phạt x Số tiền trả trước',
    vars: ['Agribank: 0%', 'VCB: 1.5% -> 0%', 'Shinhan: 6% -> 1%'],
  },
  {
    title: '3. Lợi ích ròng trả trước',
    formula: 'Lợi ích = Lãi tiết kiệm - Phí phạt',
    vars: ['> 0: Nên trả trước', '< 0: Không nên'],
  },
  {
    title: '4. DTI (Debt-to-Income)',
    formula: 'DTI = PMT / Thu nhập x 100%',
    vars: ['< 40%: An toàn', '> 50%: Rủi ro cao'],
  },
];

export function Formulas() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white">Công thức tính toán</h2>
      {formulas.map((item, i) => (
        <div
          key={i}
          className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700/50"
        >
          <h3 className="text-lg font-semibold text-emerald-400 mb-3">{item.title}</h3>
          <div className="bg-slate-900/50 rounded-xl p-4 mb-4 font-mono text-cyan-300 text-center">
            {item.formula}
          </div>
          <div className="space-y-1">
            {item.vars.map((v, j) => (
              <p key={j} className="text-sm text-slate-400">
                - {v}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { BankData, NewRateInput, NewProgramInput } from '@/types/mortgage';
import { deepClone } from '@/lib/utils';

interface BankEditorProps {
  bank: BankData;
  bankKey: string;
  onSave: (key: string, data: BankData) => void;
  onCancel: () => void;
}

type TabId = 'basic' | 'rates' | 'fees' | 'discounts' | 'requirements' | 'programs';

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: 'basic', label: 'Cơ bản' },
  { id: 'rates', label: 'Lãi suất' },
  { id: 'fees', label: 'Phí' },
  { id: 'discounts', label: 'Ưu đãi' },
  { id: 'requirements', label: 'Yêu cầu' },
  { id: 'programs', label: 'CT đặc biệt' },
];

const discountKeys = [
  'salaryAccount',
  'existingCustomer',
  'collateralAtBank',
  'lifeInsurance',
  'projectPartner',
  'youngCustomer',
  'civilServant',
  'graceDiscount',
  'refinance',
] as const;

export function BankEditor({ bank, bankKey, onSave, onCancel }: BankEditorProps) {
  const [data, setData] = useState<BankData>(deepClone(bank));
  const [tab, setTab] = useState<TabId>('basic');
  const [newRate, setNewRate] = useState<NewRateInput>({ months: '', rate: '' });
  const [newProg, setNewProg] = useState<NewProgramInput>({
    name: '',
    description: '',
    conditions: '',
    benefits: '',
  });

  const set = <K extends keyof BankData>(field: K, value: BankData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const setNested = <P extends keyof BankData, K extends keyof NonNullable<BankData[P]>>(
    parent: P,
    field: K,
    value: NonNullable<BankData[P]>[K]
  ) => {
    setData((prev) => ({
      ...prev,
      [parent]: { ...(prev[parent] as object), [field]: value },
    }));
  };

  const setDiscount = (
    key: (typeof discountKeys)[number],
    field: 'discount' | 'description',
    value: number | string
  ) => {
    setData((prev) => ({
      ...prev,
      discountConditions: {
        ...prev.discountConditions,
        [key]: { ...prev.discountConditions[key], [field]: value },
      },
    }));
  };

  const setRateAt = (i: number, field: 'months' | 'rate', value: number) => {
    const rates = [...data.interestRates];
    rates[i] = { ...rates[i], [field]: value };
    setData((prev) => ({ ...prev, interestRates: rates }));
  };

  const addRate = () => {
    if (newRate.months && newRate.rate) {
      const rates = [
        ...data.interestRates,
        { months: Number(newRate.months), rate: Number(newRate.rate) },
      ].sort((a, b) => a.months - b.months);
      setData((prev) => ({ ...prev, interestRates: rates }));
      setNewRate({ months: '', rate: '' });
    }
  };

  const removeRate = (i: number) => {
    setData((prev) => ({
      ...prev,
      interestRates: prev.interestRates.filter((_, j) => j !== i),
    }));
  };

  const setFeeAt = (i: number, v: number) => {
    const fees = [...data.prepaymentFees];
    fees[i] = { ...fees[i], fee: v };
    setData((prev) => ({ ...prev, prepaymentFees: fees }));
  };

  const addProg = () => {
    if (newProg.name) {
      setData((prev) => ({
        ...prev,
        specialPrograms: [...(prev.specialPrograms || []), { ...newProg }],
      }));
      setNewProg({ name: '', description: '', conditions: '', benefits: '' });
    }
  };

  const removeProg = (i: number) => {
    setData((prev) => ({
      ...prev,
      specialPrograms: prev.specialPrograms.filter((_, j) => j !== i),
    }));
  };

  const setFeatureAt = (i: number, v: string) => {
    const features = [...data.specialFeatures];
    features[i] = v;
    setData((prev) => ({ ...prev, specialFeatures: features }));
  };

  const addFeature = () => {
    setData((prev) => ({
      ...prev,
      specialFeatures: [...prev.specialFeatures, ''],
    }));
  };

  const removeFeature = (i: number) => {
    setData((prev) => ({
      ...prev,
      specialFeatures: prev.specialFeatures.filter((_, j) => j !== i),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col border border-slate-600 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: `${data.color}20`, color: data.color }}
              >
                {data.logo}
              </span>
              Chỉnh sửa {data.name}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition text-white"
              >
                Hủy
              </button>
              <button
                onClick={() => onSave(bankKey, data)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition font-medium text-white"
              >
                Lưu
              </button>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  tab === t.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-white">
          {tab === 'basic' && (
            <BasicTab
              data={data}
              set={set}
              setFeatureAt={setFeatureAt}
              addFeature={addFeature}
              removeFeature={removeFeature}
            />
          )}
          {tab === 'rates' && (
            <RatesTab
              data={data}
              set={set}
              setRateAt={setRateAt}
              addRate={addRate}
              removeRate={removeRate}
              newRate={newRate}
              setNewRate={setNewRate}
              setFeeAt={setFeeAt}
            />
          )}
          {tab === 'fees' && <FeesTab data={data} setNested={setNested} />}
          {tab === 'discounts' && (
            <DiscountsTab data={data} setDiscount={setDiscount} setNested={setNested} />
          )}
          {tab === 'requirements' && <RequirementsTab data={data} setNested={setNested} />}
          {tab === 'programs' && (
            <ProgramsTab
              data={data}
              setData={setData}
              newProg={newProg}
              setNewProg={setNewProg}
              addProg={addProg}
              removeProg={removeProg}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Input component
interface InputProps {
  label: string;
  value: string | number;
  onChange: (v: string | number) => void;
  type?: 'text' | 'number';
  step?: string;
  placeholder?: string;
  className?: string;
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  step,
  placeholder,
  className = '',
}: InputProps) {
  return (
    <div className={className}>
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(type === 'number' ? Number(e.target.value) : e.target.value)
        }
        placeholder={placeholder}
        className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-white"
      />
    </div>
  );
}

// Checkbox component
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-emerald-500"
      />
      <label className="text-sm text-slate-300">{label}</label>
    </div>
  );
}

// Tab components
interface BasicTabProps {
  data: BankData;
  set: <K extends keyof BankData>(field: K, value: BankData[K]) => void;
  setFeatureAt: (i: number, v: string) => void;
  addFeature: () => void;
  removeFeature: (i: number) => void;
}

function BasicTab({ data, set, setFeatureAt, addFeature, removeFeature }: BasicTabProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Tên ngân hàng"
          value={data.name}
          onChange={(v) => set('name', v as string)}
        />
        <Input
          label="Đối tượng vay"
          value={data.eligibility}
          onChange={(v) => set('eligibility', v as string)}
        />
      </div>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-emerald-400">Hạn mức & Thời hạn</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Hạn mức tối đa (VND)"
            type="number"
            value={data.maxLoan}
            onChange={(v) => set('maxLoan', v as number)}
            placeholder="0 = theo % TSĐB"
          />
          <Input
            label="LTV tối đa (%)"
            type="number"
            value={data.ltvRatio}
            onChange={(v) => set('ltvRatio', v as number)}
          />
          <Input
            label="Thời hạn vay tối đa (năm)"
            type="number"
            value={data.maxTerm}
            onChange={(v) => set('maxTerm', v as number)}
          />
          <Input
            label="Ân hạn gốc tối đa (năm)"
            type="number"
            value={data.maxGraceYears}
            onChange={(v) => set('maxGraceYears', v as number)}
          />
          <Input
            label="Tuổi tối thiểu"
            type="number"
            value={data.minAge}
            onChange={(v) => set('minAge', v as number)}
          />
          <Input
            label="Tuổi tối đa"
            type="number"
            value={data.maxAge}
            onChange={(v) => set('maxAge', v as number)}
          />
          <Input
            label="Thu nhập tối thiểu (VND)"
            type="number"
            value={data.minIncome}
            onChange={(v) => set('minIncome', v as number)}
          />
        </div>
      </div>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-purple-400">Đặc điểm nổi bật</h4>
        <div className="space-y-2">
          {data.specialFeatures?.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={f}
                onChange={(e) => setFeatureAt(i, e.target.value)}
                className="flex-1 bg-slate-600 border border-slate-500 rounded px-3 py-1 text-sm text-white"
              />
              <button
                onClick={() => removeFeature(i)}
                className="text-red-400 hover:text-red-300 px-2"
              >
                X
              </button>
            </div>
          ))}
          <button
            onClick={addFeature}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            + Thêm đặc điểm
          </button>
        </div>
      </div>
      <Input
        label="Ghi chú"
        value={data.notes || ''}
        onChange={(v) => set('notes', v as string)}
      />
    </>
  );
}

interface RatesTabProps {
  data: BankData;
  set: <K extends keyof BankData>(field: K, value: BankData[K]) => void;
  setRateAt: (i: number, field: 'months' | 'rate', value: number) => void;
  addRate: () => void;
  removeRate: (i: number) => void;
  newRate: NewRateInput;
  setNewRate: (r: NewRateInput) => void;
  setFeeAt: (i: number, v: number) => void;
}

function RatesTab({
  data,
  set,
  setRateAt,
  addRate,
  removeRate,
  newRate,
  setNewRate,
  setFeeAt,
}: RatesTabProps) {
  return (
    <>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-amber-400">Lãi suất cố định</h4>
        <div className="space-y-2">
          {data.interestRates.map((r, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-600/50 rounded-lg p-3">
              <Input
                label="Kỳ hạn (tháng)"
                type="number"
                value={r.months}
                onChange={(v) => setRateAt(i, 'months', v as number)}
                className="flex-1"
              />
              <Input
                label="Lãi suất (%/năm)"
                type="number"
                step="0.01"
                value={r.rate}
                onChange={(v) => setRateAt(i, 'rate', v as number)}
                className="flex-1"
              />
              <button
                onClick={() => removeRate(i)}
                className="mt-4 text-red-400 hover:text-red-300 px-2"
              >
                X
              </button>
            </div>
          ))}
          <div className="flex items-end gap-3 mt-3 pt-3 border-t border-slate-600">
            <Input
              label="Thêm kỳ hạn (tháng)"
              type="number"
              value={newRate.months}
              onChange={(v) => setNewRate({ ...newRate, months: String(v) })}
              placeholder="VD: 48"
              className="flex-1"
            />
            <Input
              label="Lãi suất (%)"
              type="number"
              step="0.01"
              value={newRate.rate}
              onChange={(v) => setNewRate({ ...newRate, rate: String(v) })}
              placeholder="VD: 7.5"
              className="flex-1"
            />
            <button
              onClick={addRate}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded text-sm"
            >
              + Thêm
            </button>
          </div>
        </div>
      </div>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-cyan-400">Lãi suất thả nổi</h4>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Lãi suất thả nổi hiện tại (%/năm)"
            type="number"
            step="0.1"
            value={data.floatingRate}
            onChange={(v) => set('floatingRate', v as number)}
          />
          <Input
            label="Biên độ cố định (%)"
            type="number"
            step="0.1"
            value={data.floatingSpread || 0}
            onChange={(v) => set('floatingSpread', v as number)}
          />
          <Input
            label="Lãi suất tham chiếu"
            value={data.floatingBase || ''}
            onChange={(v) => set('floatingBase', v as string)}
            className="col-span-2"
          />
          <Input
            label="Công thức tính"
            value={data.floatingFormula || ''}
            onChange={(v) => set('floatingFormula', v as string)}
            className="col-span-2"
          />
        </div>
      </div>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-red-400">Phí phạt trả nợ trước hạn (%)</h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {data.prepaymentFees.map((f, i) => (
            <div key={i} className="text-center">
              <label className="text-xs text-slate-400 block">Năm {f.year}</label>
              <input
                type="number"
                step="0.1"
                value={f.fee}
                onChange={(e) => setFeeAt(i, Number(e.target.value))}
                className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-center text-white"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

interface FeesTabProps {
  data: BankData;
  setNested: <P extends keyof BankData, K extends keyof NonNullable<BankData[P]>>(
    parent: P,
    field: K,
    value: NonNullable<BankData[P]>[K]
  ) => void;
}

function FeesTab({ data, setNested }: FeesTabProps) {
  return (
    <>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-amber-400">Phí thẩm định</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="% giá trị TSĐB"
            type="number"
            step="0.01"
            value={data.fees?.appraisalFeePercent || 0}
            onChange={(v) => setNested('fees', 'appraisalFeePercent', v as number)}
          />
          <Input
            label="Phí tối thiểu (VND)"
            type="number"
            value={data.fees?.appraisalFeeMin || 0}
            onChange={(v) => setNested('fees', 'appraisalFeeMin', v as number)}
          />
          <Input
            label="Phí tối đa (VND)"
            type="number"
            value={data.fees?.appraisalFeeMax || 0}
            onChange={(v) => setNested('fees', 'appraisalFeeMax', v as number)}
          />
        </div>
      </div>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-blue-400">Các loại phí khác</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="Phí bảo hiểm TS (%/năm)"
            type="number"
            step="0.01"
            value={data.fees?.insuranceFeePercent || 0}
            onChange={(v) => setNested('fees', 'insuranceFeePercent', v as number)}
          />
          <Input
            label="Phí công chứng (%)"
            type="number"
            step="0.01"
            value={data.fees?.notaryFeePercent || 0}
            onChange={(v) => setNested('fees', 'notaryFeePercent', v as number)}
          />
          <Input
            label="Phí đăng ký GĐBĐ (VND)"
            type="number"
            value={data.fees?.registrationFee || 0}
            onChange={(v) => setNested('fees', 'registrationFee', v as number)}
          />
          <Input
            label="Phí duy trì TK (VND/tháng)"
            type="number"
            value={data.fees?.accountMaintenanceFee || 0}
            onChange={(v) => setNested('fees', 'accountMaintenanceFee', v as number)}
          />
          <Input
            label="Phí giải ngân (VND)"
            type="number"
            value={data.fees?.disbursementFee || 0}
            onChange={(v) => setNested('fees', 'disbursementFee', v as number)}
          />
          <Input
            label="Phí trả trước tối thiểu (VND)"
            type="number"
            value={data.fees?.earlyRepaymentFeeMin || 0}
            onChange={(v) => setNested('fees', 'earlyRepaymentFeeMin', v as number)}
          />
        </div>
      </div>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-red-400">Phạt trả chậm</h4>
        <Input
          label="% lãi suất phạt so với LS vay (VD: 150 = 150%)"
          type="number"
          value={data.fees?.latePaymentPenalty || 150}
          onChange={(v) => setNested('fees', 'latePaymentPenalty', v as number)}
          className="w-full md:w-1/3"
        />
      </div>
    </>
  );
}

interface DiscountsTabProps {
  data: BankData;
  setDiscount: (
    key: (typeof discountKeys)[number],
    field: 'discount' | 'description',
    value: number | string
  ) => void;
  setNested: <P extends keyof BankData, K extends keyof NonNullable<BankData[P]>>(
    parent: P,
    field: K,
    value: NonNullable<BankData[P]>[K]
  ) => void;
}

function DiscountsTab({ data, setDiscount, setNested }: DiscountsTabProps) {
  return (
    <div className="bg-slate-700/30 rounded-xl p-4">
      <h4 className="font-semibold mb-3 text-emerald-400">Điều kiện giảm lãi suất</h4>
      <p className="text-xs text-slate-400 mb-4">
        Nhập % giảm lãi suất khi KH đáp ứng điều kiện
      </p>
      <div className="space-y-3">
        {discountKeys.map((key) => (
          <div key={key} className="flex items-center gap-3 bg-slate-600/30 rounded-lg p-3">
            <div className="w-24">
              <label className="text-xs text-slate-400">Giảm (%)</label>
              <input
                type="number"
                step="0.1"
                value={data.discountConditions?.[key]?.discount || 0}
                onChange={(e) => setDiscount(key, 'discount', Number(e.target.value))}
                className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400">Mô tả điều kiện</label>
              <input
                type="text"
                value={data.discountConditions?.[key]?.description || ''}
                onChange={(e) => setDiscount(key, 'description', e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Input
          label="Tổng mức giảm tối đa (%)"
          type="number"
          step="0.1"
          value={data.discountConditions?.maxDiscount || 0}
          onChange={(v) => setNested('discountConditions', 'maxDiscount', v as number)}
          className="w-full md:w-1/4"
        />
      </div>
    </div>
  );
}

interface RequirementsTabProps {
  data: BankData;
  setNested: <P extends keyof BankData, K extends keyof NonNullable<BankData[P]>>(
    parent: P,
    field: K,
    value: NonNullable<BankData[P]>[K]
  ) => void;
}

function RequirementsTab({ data, setNested }: RequirementsTabProps) {
  return (
    <>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-blue-400">Yêu cầu tài sản đảm bảo</h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Tỷ lệ TSĐB tối thiểu (%)"
            type="number"
            value={data.collateralRequirements?.minCollateralRatio || 130}
            onChange={(v) =>
              setNested('collateralRequirements', 'minCollateralRatio', v as number)
            }
          />
          <Checkbox
            label="Chấp nhận TSĐB hình thành từ vốn vay"
            checked={data.collateralRequirements?.acceptFormedAsset || false}
            onChange={(v) => setNested('collateralRequirements', 'acceptFormedAsset', v)}
          />
        </div>
        <Input
          label="Loại TSĐB chấp nhận (phân cách bằng dấu phẩy)"
          value={data.collateralRequirements?.acceptedTypes?.join(', ') || ''}
          onChange={(v) =>
            setNested(
              'collateralRequirements',
              'acceptedTypes',
              (v as string).split(',').map((s) => s.trim())
            )
          }
        />
        <Input
          label="Giấy tờ cần thiết (phân cách bằng dấu phẩy)"
          value={data.collateralRequirements?.requiredDocuments?.join(', ') || ''}
          onChange={(v) =>
            setNested(
              'collateralRequirements',
              'requiredDocuments',
              (v as string).split(',').map((s) => s.trim())
            )
          }
          className="mt-3"
        />
      </div>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-amber-400">Yêu cầu thu nhập</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="DTI tối đa (%)"
            type="number"
            value={data.incomeRequirements?.minDTI || 50}
            onChange={(v) => setNested('incomeRequirements', 'minDTI', v as number)}
          />
          <Input
            label="Kinh nghiệm tối thiểu (tháng)"
            type="number"
            value={data.incomeRequirements?.minWorkExperience || 6}
            onChange={(v) =>
              setNested('incomeRequirements', 'minWorkExperience', v as number)
            }
          />
          <Checkbox
            label="Chấp nhận thử việc"
            checked={data.incomeRequirements?.probationAccepted || false}
            onChange={(v) => setNested('incomeRequirements', 'probationAccepted', v)}
          />
        </div>
        <Input
          label="Nguồn thu nhập chấp nhận (phân cách bằng dấu phẩy)"
          value={data.incomeRequirements?.acceptedIncomeSources?.join(', ') || ''}
          onChange={(v) =>
            setNested(
              'incomeRequirements',
              'acceptedIncomeSources',
              (v as string).split(',').map((s) => s.trim())
            )
          }
          className="mt-3"
        />
        <Input
          label="Loại hợp đồng LĐ (phân cách bằng dấu phẩy)"
          value={data.incomeRequirements?.contractTypes?.join(', ') || ''}
          onChange={(v) =>
            setNested(
              'incomeRequirements',
              'contractTypes',
              (v as string).split(',').map((s) => s.trim())
            )
          }
          className="mt-3"
        />
      </div>
      <div className="bg-slate-700/30 rounded-xl p-4">
        <h4 className="font-semibold mb-3 text-cyan-400">Thời gian xử lý</h4>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Phê duyệt (ngày)"
            type="number"
            value={data.processingTime?.approvalDays || 3}
            onChange={(v) => setNested('processingTime', 'approvalDays', v as number)}
          />
          <Input
            label="Giải ngân (ngày)"
            type="number"
            value={data.processingTime?.disbursementDays || 5}
            onChange={(v) => setNested('processingTime', 'disbursementDays', v as number)}
          />
          <Input
            label="Hiệu lực hồ sơ (ngày)"
            type="number"
            value={data.processingTime?.documentValidityDays || 30}
            onChange={(v) =>
              setNested('processingTime', 'documentValidityDays', v as number)
            }
          />
        </div>
      </div>
    </>
  );
}

interface ProgramsTabProps {
  data: BankData;
  setData: React.Dispatch<React.SetStateAction<BankData>>;
  newProg: NewProgramInput;
  setNewProg: (p: NewProgramInput) => void;
  addProg: () => void;
  removeProg: (i: number) => void;
}

function ProgramsTab({
  data,
  setData,
  newProg,
  setNewProg,
  addProg,
  removeProg,
}: ProgramsTabProps) {
  return (
    <div className="bg-slate-700/30 rounded-xl p-4">
      <h4 className="font-semibold mb-3 text-emerald-400">Chương trình ưu đãi đặc biệt</h4>
      <div className="space-y-4">
        {data.specialPrograms?.map((p, i) => (
          <div key={i} className="bg-slate-600/30 rounded-lg p-4 relative">
            <button
              onClick={() => removeProg(i)}
              className="absolute top-2 right-2 text-red-400 hover:text-red-300"
            >
              X
            </button>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={p.name}
                onChange={(e) => {
                  const progs = [...data.specialPrograms];
                  progs[i] = { ...progs[i], name: e.target.value };
                  setData((d) => ({ ...d, specialPrograms: progs }));
                }}
                placeholder="Tên CT"
                className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white"
              />
              <input
                type="text"
                value={p.description}
                onChange={(e) => {
                  const progs = [...data.specialPrograms];
                  progs[i] = { ...progs[i], description: e.target.value };
                  setData((d) => ({ ...d, specialPrograms: progs }));
                }}
                placeholder="Mô tả"
                className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white"
              />
              <input
                type="text"
                value={p.conditions}
                onChange={(e) => {
                  const progs = [...data.specialPrograms];
                  progs[i] = { ...progs[i], conditions: e.target.value };
                  setData((d) => ({ ...d, specialPrograms: progs }));
                }}
                placeholder="Điều kiện"
                className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white"
              />
              <input
                type="text"
                value={p.benefits}
                onChange={(e) => {
                  const progs = [...data.specialPrograms];
                  progs[i] = { ...progs[i], benefits: e.target.value };
                  setData((d) => ({ ...d, specialPrograms: progs }));
                }}
                placeholder="Quyền lợi"
                className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
        ))}
        <div className="border-t border-slate-600 pt-4">
          <h5 className="text-sm font-medium text-slate-300 mb-3">
            Thêm chương trình mới
          </h5>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newProg.name}
              onChange={(e) => setNewProg({ ...newProg, name: e.target.value })}
              placeholder="Ten CT"
              className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm text-white"
            />
            <input
              type="text"
              value={newProg.description}
              onChange={(e) => setNewProg({ ...newProg, description: e.target.value })}
              placeholder="Mo ta"
              className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm text-white"
            />
            <input
              type="text"
              value={newProg.conditions}
              onChange={(e) => setNewProg({ ...newProg, conditions: e.target.value })}
              placeholder="Dieu kien"
              className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm text-white"
            />
            <input
              type="text"
              value={newProg.benefits}
              onChange={(e) => setNewProg({ ...newProg, benefits: e.target.value })}
              placeholder="Quyen loi"
              className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            onClick={addProg}
            className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
          >
            + Thêm CT
          </button>
        </div>
      </div>
    </div>
  );
}

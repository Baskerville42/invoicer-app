import React, { useMemo } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Copy,
  Download,
  Euro,
  FileEdit,
  FileText,
  FileUp,
  Hash,
  Loader2,
  ShieldCheck,
  X,
} from 'lucide-react';

import { ProgressStepper } from './ProgressStepper';
import { useInvoiceGeneration } from './useInvoiceGeneration';
import { useInvoiceStore } from '../../../shared/store';

const steps = [
  { label: 'Підготовка', icon: FileText },
  { label: 'Копіювання', icon: Copy },
  { label: 'Заміна', icon: FileEdit },
  { label: 'Експорт PDF', icon: FileUp },
  { label: 'Збереження', icon: Download },
];

export const InvoiceForm: React.FC = () => {
  const { price, setPrice, month, setMonth, year, setYear, status, statusType, generationStep } =
    useInvoiceStore();

  const { handleGenerate } = useInvoiceGeneration();

  const monthNames = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    []
  );
  const currentYearNum = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 3 }, (_, i) => (currentYearNum - 1 + i).toString()),
    [currentYearNum]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/80 backdrop-blur-xl border border-white rounded-4xl shadow-2xl shadow-slate-200/50 p-8 md:p-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Field: Month */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider pl-1">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Місяць
          </label>
          <div className="relative">
            <select
              className="select select-bordered w-full select-lg rounded-xl"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {monthNames.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Field: Year */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider pl-1">
            <Hash className="w-4 h-4 text-indigo-500" />
            Рік
          </label>
          <div className="relative">
            <select
              className="select select-bordered w-full select-lg rounded-xl"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Field: Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pl-1">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <Euro className="w-4 h-4 text-indigo-500" />
              Сума інвойсу
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              className="input input-bordered input-lg w-full rounded-xl"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGenerate}
        disabled={generationStep !== null && generationStep < 4}
        className={`w-full group relative overflow-hidden flex items-center justify-center gap-3 py-5 rounded-[1.25rem] font-bold text-lg shadow-xl transition-all duration-300 ${
          generationStep !== null && generationStep < 4
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
        }`}
      >
        {generationStep !== null && generationStep < 4 ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Зачекайте...
          </>
        ) : (
          <>
            <Download className="w-6 h-6" />
            Згенерувати Інвойс
          </>
        )}
      </motion.button>

      <ProgressStepper generationStep={generationStep} steps={steps} />

      {/* Status Message */}
      <AnimatePresence mode="wait">
        {status && (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-6 p-5 rounded-2xl flex items-start gap-3 border-2 ${
              statusType === 'error'
                ? 'bg-red-50 text-red-700 border-red-100'
                : statusType === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}
          >
            {statusType === 'error' ? (
              <X className="w-5 h-5 shrink-0 mt-0.5" />
            ) : statusType === 'success' ? (
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <Loader2 className="w-5 h-5 shrink-0 mt-0.5 animate-spin" />
            )}
            <p className="font-semibold text-sm leading-relaxed">{status}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

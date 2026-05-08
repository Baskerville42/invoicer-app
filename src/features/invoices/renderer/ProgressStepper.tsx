import React from 'react';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ProgressStepperProps {
  generationStep: number | null;
  steps: Array<{ label: string; icon: any }>;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ generationStep, steps }) => {
  if (generationStep === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-12 overflow-hidden"
    >
      <div className="relative mb-8 px-2">
        <div className="absolute top-5 left-0 right-0 h-1 bg-slate-100 rounded-full z-0" />
        <motion.div
          className="absolute top-5 left-0 h-1 bg-indigo-500 rounded-full z-0"
          initial={{ width: 0 }}
          animate={{ width: `${(generationStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        <div className="relative flex justify-between z-10">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === generationStep;
            const isCompleted = idx < generationStep;
            const isLastCompleted = generationStep === 4 && idx === 4;

            return (
              <div key={idx} className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    borderColor: isActive || isCompleted || isLastCompleted ? '#6366f1' : '#f1f5f9',
                    backgroundColor:
                      isCompleted || isLastCompleted ? '#6366f1' : isActive ? '#ffffff' : '#f8fafc',
                  }}
                  className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-colors duration-300 shadow-sm`}
                >
                  {isCompleted || isLastCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <StepIcon
                      className={`w-6 h-6 ${isActive ? 'text-indigo-600' : 'text-slate-300'}`}
                    />
                  )}
                </motion.div>
                <span
                  className={`mt-3 text-[11px] font-bold uppercase tracking-widest ${
                    isActive
                      ? 'text-indigo-600'
                      : isCompleted || isLastCompleted
                        ? 'text-slate-900'
                        : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

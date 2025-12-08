import React, { useState } from 'react';
import { DollarSign, Target, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { MoneyFlowData, SavingGoal, Transaction } from '../types';

interface OnboardingProps {
  onComplete: (data: { income: number; goalName: string; goalAmount: number }) => void;
  userName: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, userName }) => {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState<number | ''>('');
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState<number | ''>('');

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFinish = () => {
    if (income && goalName && goalAmount) {
      onComplete({
        income: Number(income),
        goalName,
        goalAmount: Number(goalAmount),
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="max-w-xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden transition-colors duration-200">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Let's set up your profile</h2>
          <p className="text-gray-500 dark:text-gray-400">Step {step} of 3</p>
        </div>

        {/* Step 1: Income */}
        {step === 1 && (
          <div className="animate-fade-in">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                <DollarSign size={32} />
             </div>
             <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">What is your monthly income?</h3>
             <p className="text-gray-500 dark:text-gray-400 text-center mb-8">We'll use this to help track your cash flow and set budgets.</p>
             
             <div className="relative mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input 
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-0 text-2xl font-bold text-center outline-none transition-colors"
                  placeholder="0"
                  autoFocus
                />
             </div>

             <button 
                onClick={handleNext}
                disabled={!income}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
                Continue <ArrowRight size={20} />
             </button>
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
           <div className="animate-fade-in">
             <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400">
                <Target size={32} />
             </div>
             <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">Set a savings goal</h3>
             <p className="text-gray-500 dark:text-gray-400 text-center mb-8">What are you saving for? We'll help you track your progress.</p>
             
             <div className="space-y-4 mb-8">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Goal Name</label>
                    <input 
                        type="text"
                        value={goalName}
                        onChange={(e) => setGoalName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-0 text-lg outline-none transition-colors"
                        placeholder="e.g. New Laptop"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Amount</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input 
                        type="number"
                        value={goalAmount}
                        onChange={(e) => setGoalAmount(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-0 text-lg outline-none transition-colors"
                        placeholder="1000"
                        />
                    </div>
                </div>
             </div>

             <div className="flex gap-4">
                <button 
                    onClick={handleBack}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                    Back
                </button>
                <button 
                    onClick={handleNext}
                    disabled={!goalName || !goalAmount}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    Continue <ArrowRight size={20} />
                </button>
             </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
           <div className="animate-fade-in text-center">
             <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400 animate-bounce">
                <CheckCircle size={40} />
             </div>
             <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">You're all set, {userName}!</h3>
             <p className="text-gray-500 dark:text-gray-400 mb-8">Your dashboard has been personalized based on your inputs.</p>
             
             <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8 text-left">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 dark:text-gray-400">Monthly Income</span>
                    <span className="font-bold text-gray-900 dark:text-white">${Number(income).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Goal: {goalName}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">${Number(goalAmount).toLocaleString()}</span>
                </div>
             </div>

             <button 
                onClick={handleFinish}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
             >
                Go to Dashboard
             </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
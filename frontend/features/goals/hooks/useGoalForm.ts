import { useState } from 'react';
import { GoalPriority } from '../../../types';

export const useGoalForm = () => {
  const [formName, setFormName] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formPriority, setFormPriority] = useState<GoalPriority>('Medium');
  const [formCategory, setFormCategory] = useState('General');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormTarget('');
    setFormCurrent('');
    setFormDeadline('');
    setFormPriority('Medium');
    setFormCategory('General');
    setSubmitError(null);
  };

  const validateForm = () => {
    const target = parseFloat(formTarget);
    const current = parseFloat(formCurrent) || 0;

    if (isNaN(target) || target <= 0) {
      setSubmitError('Please enter a valid target amount');
      return false;
    }

    if (current < 0 || current > target) {
      setSubmitError('Initial saved amount must be between 0 and target');
      return false;
    }

    setSubmitError(null);
    return true;
  };

  const getFormData = () => ({
    name: formName,
    target: parseFloat(formTarget),
    current: parseFloat(formCurrent) || 0,
    deadline: formDeadline,
    priority: formPriority.toLowerCase() as GoalPriority,
    category: formCategory,
  });

  return {
    formData: {
      name: formName,
      target: formTarget,
      current: formCurrent,
      deadline: formDeadline,
      priority: formPriority,
      category: formCategory,
    },
    setters: {
      setFormName,
      setFormTarget,
      setFormCurrent,
      setFormDeadline,
      setFormPriority,
      setFormCategory,
    },
    submitError,
    setSubmitError,
    resetForm,
    validateForm,
    getFormData,
  };
};


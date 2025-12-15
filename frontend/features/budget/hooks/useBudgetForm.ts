import { useState } from 'react';

export default function useBudgetForm() {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [type, setType] = useState<'Fixed' | 'Variable'>('Variable');
  const [rollover, setRollover] = useState(false);

  const reset = () => {
    setCategory('');
    setLimit('');
    setType('Variable');
    setRollover(false);
  };

  return {
    form: { category, limit, type, rollover },
    setters: { setCategory, setLimit, setType, setRollover },
    reset,
  };
}
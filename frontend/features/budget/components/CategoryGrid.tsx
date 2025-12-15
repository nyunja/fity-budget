import React, { useState } from 'react';
import { BudgetAnalysis } from '../hooks/useBudgetAnalysis';
import CategoryCard from './CategoryCard';

const CategoryGrid: React.FC<{
  analysis: BudgetAnalysis[];
  onDelete: () => void;
  deleting: boolean;
}> = ({ analysis, onDelete, deleting }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {analysis.map(item => (
        <CategoryCard
          key={item.id}
          item={item}
          isExpanded={expanded === item.category}
          onToggle={() => setExpanded(expanded === item.category ? null : item.category)}
          onDelete={onDelete}
          deleting={deleting}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;
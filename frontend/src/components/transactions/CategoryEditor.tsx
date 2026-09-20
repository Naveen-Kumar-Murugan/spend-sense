import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CATEGORY_META, CATEGORY_ORDER } from '@/constants/categories';
import type { Category, Transaction } from '@/types';
import { titleCase } from '@/utils/format';

interface Props {
  transaction: Transaction;
  saving: boolean;
  error?: string | null;
  onSave: (category: Category, subcategory: string) => void;
  onCancel?: () => void;
}

export function CategoryEditor({ transaction, saving, error, onSave, onCancel }: Props) {
  const [category, setCategory] = useState<Category>(transaction.category);
  const [subcategory, setSubcategory] = useState<string>(transaction.subcategory);

  useEffect(() => {
    setCategory(transaction.category);
    setSubcategory(transaction.subcategory);
  }, [transaction]);

  const options = CATEGORY_META[category].subcategories;
  const unchanged = category === transaction.category && subcategory === transaction.subcategory;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-category">Category</Label>
        <Select
          id="edit-category"
          value={category}
          onChange={(event) => {
            const next = event.target.value as Category;
            setCategory(next);
            setSubcategory(CATEGORY_META[next].subcategories[0]);
          }}
        >
          {CATEGORY_ORDER.map((item) => (
            <option key={item} value={item}>
              {CATEGORY_META[item].label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="edit-subcategory">Sub-category</Label>
        <Select
          id="edit-subcategory"
          value={subcategory}
          onChange={(event) => setSubcategory(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="text-[13px] text-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2.5">
        <Button onClick={() => onSave(category, subcategory)} loading={saving} disabled={unchanged} className="flex-1">
          Save category
        </Button>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

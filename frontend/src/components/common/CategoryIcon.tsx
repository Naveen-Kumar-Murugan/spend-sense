import { CATEGORY_META } from '@/constants/categories';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'h-8 w-8 rounded-lg [&>svg]:h-3.5 [&>svg]:w-3.5',
  md: 'h-10 w-10 rounded-xl [&>svg]:h-[18px] [&>svg]:w-[18px]',
  lg: 'h-12 w-12 rounded-2xl [&>svg]:h-5 [&>svg]:w-5',
} as const;

export function CategoryIcon({ category, size = 'md', className }: CategoryIconProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', meta.tile, SIZES[size], className)}
      aria-hidden
    >
      <Icon strokeWidth={2.2} />
    </span>
  );
}

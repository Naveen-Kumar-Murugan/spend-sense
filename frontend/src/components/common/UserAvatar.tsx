import { cn } from '@/lib/utils';
import { initials } from '@/utils/format';
import type { AuthUser } from '@/types';

interface UserAvatarProps {
  user: Pick<AuthUser, 'firstName' | 'lastName' | 'avatarUrl'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-xs', lg: 'h-20 w-20 text-xl' } as const;

export function UserAvatar({ user, size = 'md', className }: UserAvatarProps) {
  const label = initials(user.firstName, user.lastName);
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className={cn('rounded-full object-cover ring-2 ring-white', SIZES[size], className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-400 font-bold text-white ring-2 ring-white',
        SIZES[size],
        className,
      )}
    >
      {label}
    </span>
  );
}

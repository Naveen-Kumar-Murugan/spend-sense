import { NavLink } from 'react-router-dom';
import { APP_NAV } from '@/constants/navigation';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const items = APP_NAV.filter((item) => item.mobile);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold transition-colors',
                  isActive ? 'text-primary' : 'text-ink-faint',
                )
              }
            >
              <item.icon className="h-[19px] w-[19px]" strokeWidth={2.2} aria-hidden />
              <span className="truncate">{item.label.replace('Ask SpendSense', 'Ask').replace('Make payment', 'Pay')}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

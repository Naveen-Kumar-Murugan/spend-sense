import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Settings2, UserRound } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';

export function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-xl p-2 text-ink-muted transition-colors hover:bg-surface-sunken lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <SheetContent side="right" className="p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <AppSidebar inDrawer onNavigate={() => setDrawerOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="lg:hidden">
          <Logo to="/app" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/app/insights"
            className="relative rounded-xl border border-line p-2.5 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" aria-hidden />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 rounded-full p-0.5 transition-opacity hover:opacity-90"
              aria-label="Account menu"
            >
              <UserAvatar user={user} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user.firstName} {user.lastName}
              </DropdownMenuLabel>
              <p className="truncate px-2.5 pb-2 text-xs text-ink-faint">{user.email}</p>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/app/settings')}>
                <UserRound className="h-4 w-4" aria-hidden />
                Your profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/app/settings')}>
                <Settings2 className="h-4 w-4" aria-hidden />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger focus:text-danger" onSelect={handleSignOut}>
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

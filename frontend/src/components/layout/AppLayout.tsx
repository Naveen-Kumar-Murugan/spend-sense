import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/navigation/AppSidebar';
import { MobileNav } from '@/components/navigation/MobileNav';
import { AppHeader } from './AppHeader';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <AppSidebar />
      <div className="lg:pl-[248px]">
        <AppHeader />
        <main
          id="main"
          className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12"
        >
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

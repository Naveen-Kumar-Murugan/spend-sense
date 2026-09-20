import { Suspense, lazy, useEffect, useState } from 'react';
import type { ComponentType } from 'react';

const LazyScene = lazy(async () => {
  const [{ Canvas }, fiber] = await Promise.all([
    import('@react-three/fiber'),
    import('./OrbScene'),
  ]);
  const Scene = fiber.OrbScene as ComponentType<{ Canvas: ComponentType<any> }>;
  return {
    default: function Wrapped() {
      return <Scene Canvas={Canvas as ComponentType<any>} />;
    },
  };
});

/** Lazy 3D orb. three.js only loads when this mounts; gradient shows meanwhile. */
export function Orb3D({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) {
      const id = idle.call(window, () => setMounted(true));
      return () => (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setMounted(true), 1200);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className={className} role="img" aria-label="Interactive 3D visualization of spending intelligence">
      <div className="absolute inset-0 animate-pulse-soft rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(99,102,241,0.4),rgba(34,211,238,0.12)_45%,transparent_70%)] blur-2xl" aria-hidden />
      {mounted ? (
        <Suspense fallback={null}>
          <LazyScene />
        </Suspense>
      ) : null}
    </div>
  );
}




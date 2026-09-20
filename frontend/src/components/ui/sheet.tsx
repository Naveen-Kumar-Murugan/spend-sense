import type * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

export const SheetContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: 'right' | 'bottom' }
>(({ className, children, side = 'right', ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 bg-white shadow-lift focus:outline-none',
        side === 'right'
          ? 'inset-y-0 right-0 w-full max-w-md border-l border-line data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right'
          : 'inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
        aria-label="Close"
      >
        <X className="h-4 w-4" aria-hidden />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';

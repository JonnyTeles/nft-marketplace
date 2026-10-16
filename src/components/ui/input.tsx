import * as React from 'react';
import { cn } from '@/lib/cn';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => <input ref={ref} type={type} className={cn('flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props}/>);
Input.displayName = 'Input';

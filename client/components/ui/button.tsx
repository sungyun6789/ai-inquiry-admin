import { ComponentProps } from 'react';

const VARIANT_STYLE = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/85',
  secondary: 'border bg-background hover:bg-muted',
};

const SIZE_STYLE = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
};

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof VARIANT_STYLE;
  size?: keyof typeof SIZE_STYLE;
};

export function Button({ variant = 'secondary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${VARIANT_STYLE[variant]} ${SIZE_STYLE[size]} ${className}`}
      {...props}
    />
  );
}

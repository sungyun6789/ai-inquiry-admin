import { ComponentProps } from 'react';

const TONE_STYLE = {
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-green-100 text-green-700',
  neutral: 'bg-neutral-100 text-neutral-600',
};

type BadgeProps = ComponentProps<'span'> & {
  tone?: keyof typeof TONE_STYLE;
};

export function Badge({ tone = 'neutral', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_STYLE[tone]} ${className}`}
      {...props}
    />
  );
}

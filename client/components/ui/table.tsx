import { ComponentProps } from 'react';

export function Table({ className = '', ...props }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className={`w-full text-left text-sm ${className}`} {...props} />
    </div>
  );
}

export function TableHeader({ className = '', ...props }: ComponentProps<'thead'>) {
  return <thead className={`border-b bg-muted ${className}`} {...props} />;
}

export function TableBody({ className = '', ...props }: ComponentProps<'tbody'>) {
  return <tbody className={`divide-y ${className}`} {...props} />;
}

export function TableRow({ className = '', ...props }: ComponentProps<'tr'>) {
  return <tr className={`transition-colors hover:bg-muted ${className}`} {...props} />;
}

export function TableHead({ className = '', ...props }: ComponentProps<'th'>) {
  return <th className={`h-11 px-4 font-medium text-muted-foreground ${className}`} {...props} />;
}

export function TableCell({ className = '', ...props }: ComponentProps<'td'>) {
  return <td className={`px-4 py-3 ${className}`} {...props} />;
}

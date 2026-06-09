type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'cyan';

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-green-500/10 text-green-400 border border-green-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  red: 'bg-red-500/10 text-red-400 border border-red-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  gray: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
  cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export default function Badge({ label, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {label}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    active: 'green',
    approved: 'green',
    completed: 'blue',
    pending: 'yellow',
    draft: 'gray',
    rejected: 'red',
    paused: 'yellow',
    failed: 'red',
  };
  return <Badge label={status} variant={map[status] ?? 'gray'} />;
}

import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '@/lib/format';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={getStatusColor(status)} className={className}>
      {getStatusLabel(status)}
    </Badge>
  );
}

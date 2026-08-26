import { Icon } from '@iconify/react';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = 'Nothing here yet.' }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <Icon icon="solar:box-minimalistic-linear" width={36} className="text-taupe/50 mx-auto mb-3" />
      <p className="text-sm text-taupe">{message}</p>
    </div>
  );
}

import { Icon } from '@iconify/react';

interface ErrorStateProps {
  message?: string;
}

export default function ErrorState({ message = 'Something went wrong.' }: ErrorStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="alert">
      <div className="text-center px-6">
        <Icon icon="solar:shield-warning-linear" width={48} className="text-taupe mx-auto mb-4" />
        <p className="text-lg font-medium text-charcoal mb-2">Error</p>
        <p className="text-sm text-stone">{message}</p>
      </div>
    </div>
  );
}

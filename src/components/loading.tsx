import { type FC } from "react";

export const Spinner: FC<{ className?: string }> = ({ className = "" }) => (
  <div
    role="status"
    aria-label="Laden"
    className={`h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-primary-100 ${className}`}
  />
);

export const Loading: FC<{ label?: string }> = ({ label = "Laden…" }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
    <Spinner />
    <span className="text-sm">{label}</span>
  </div>
);

export const ErrorState: FC<{ message?: string; onRetry?: () => void }> = ({
  message = "Daten konnten nicht geladen werden.",
  onRetry,
}) => (
  <div className="card flex flex-col items-center gap-3 py-8 text-center">
    <p className="text-red-300">{message}</p>
    {onRetry && (
      <button className="btn btn-secondary" onClick={onRetry}>
        Erneut versuchen
      </button>
    )}
  </div>
);

export const EmptyState: FC<{ title: string; hint?: string; action?: React.ReactNode }> = ({
  title,
  hint,
  action,
}) => (
  <div className="card flex flex-col items-center gap-2 py-8 text-center">
    <p className="font-medium text-white">{title}</p>
    {hint && <p className="text-sm text-muted">{hint}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

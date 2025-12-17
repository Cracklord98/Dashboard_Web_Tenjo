/**
 * Componente de error reutilizable
 */

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <div className="mb-2 text-4xl">⚠️</div>
        <p className="mb-2 font-medium text-red-800">Error</p>
        <p className="mb-4 text-sm text-red-600">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Componente de loading reutilizable
 */

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'Cargando...' }: LoadingProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

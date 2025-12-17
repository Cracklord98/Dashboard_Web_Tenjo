import { obtenerSeguimiento } from '../../lib/api';
import { useApi } from '../../hooks/useApi';
import DataTable from '../../components/dashboard/DataTable';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function SeguimientoPage() {
  const { data, loading, error, refetch } = useApi({
    fetchFn: obtenerSeguimiento,
  });

  if (loading) {
    return <Loading message="Cargando seguimientos..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const seguimientos = data?.items || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seguimiento de Proyectos</h1>
          <p className="mt-2 text-gray-600">Estado y progreso de todos los proyectos</p>
        </div>

        {/* Tabla */}
        <DataTable data={seguimientos} />

        {/* Estadísticas rápidas */}
        {seguimientos.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{seguimientos.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-blue-600">
                {seguimientos.filter((s) => s.estado === 'en_progreso').length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">
                {seguimientos.filter((s) => s.estado === 'completado').length}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {seguimientos.filter((s) => s.estado === 'pendiente').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

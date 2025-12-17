import { obtenerIndicadores } from '../../lib/api';
import { useApi } from '../../hooks/useApi';
import KpiCard from '../../components/dashboard/KpiCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function DashboardPage() {
  const { data, loading, error, refetch } = useApi({
    fetchFn: obtenerIndicadores,
  });

  if (loading) {
    return <Loading message="Cargando indicadores..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  const indicadores = data?.indicadores || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Indicadores clave de rendimiento</p>
        </div>

        {/* Grid de KPIs */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {indicadores.map((indicador) => (
            <KpiCard key={indicador.id} indicador={indicador} />
          ))}
        </div>

        {/* Mensaje si no hay datos */}
        {indicadores.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500">No hay indicadores disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

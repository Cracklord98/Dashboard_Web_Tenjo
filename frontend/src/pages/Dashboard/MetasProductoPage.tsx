import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

interface MetaProducto {
  id: number;
  meta: string;
  programa: string;
  estadoEvaluacion: string;
  estado: string;
  responsable: string;
  avance2024: number;
  avance2025: number;
}

const MetasProductoPage = () => {
  const [metas, setMetas] = useState<MetaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [añoSeleccionado, setAñoSeleccionado] = useState('2025');
  const [programaSeleccionado, setProgramaSeleccionado] = useState('todos');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const cargarMetas = async () => {
    try {
      setLoading(true);
      // Aquí se conectará con la API real
      // const response = await fetch('/api/metas-producto');
      // const data = await response.json();
      
      // Datos de ejemplo
      const datosEjemplo: MetaProducto[] = [
        {
          id: 1,
          meta: 'Implementar sistema de gestión documental',
          programa: 'Modernización Administrativa',
          estadoEvaluacion: 'En evaluación',
          estado: 'En proceso',
          responsable: 'Juan Pérez',
          avance2024: 85,
          avance2025: 45,
        },
        {
          id: 2,
          meta: 'Capacitación en competencias digitales',
          programa: 'Educación',
          estadoEvaluacion: 'Aprobado',
          estado: 'Cumplido',
          responsable: 'María González',
          avance2024: 100,
          avance2025: 90,
        },
        {
          id: 3,
          meta: 'Mejoramiento de infraestructura deportiva',
          programa: 'Deporte y Recreación',
          estadoEvaluacion: 'Pendiente',
          estado: 'Pendiente',
          responsable: 'Carlos López',
          avance2024: 40,
          avance2025: 20,
        },
      ];
      
      setMetas(datosEjemplo);
      setError(null);
    } catch (err) {
      setError('Error al cargar las metas de producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetas();
  }, []);

  // Filtrar metas
  const metasFiltradas = metas.filter(meta => {
    const cumpleBusqueda = meta.meta.toLowerCase().includes(busqueda.toLowerCase()) ||
                          meta.responsable.toLowerCase().includes(busqueda.toLowerCase());
    const cumplePrograma = programaSeleccionado === 'todos' || meta.programa === programaSeleccionado;
    const cumpleEstado = estadoSeleccionado === 'todos' || meta.estado === estadoSeleccionado;
    
    return cumpleBusqueda && cumplePrograma && cumpleEstado;
  });

  // KPIs
  const totalMetas = metas.length;
  const metasAltoAvance = metas.filter(m => {
    const avance = añoSeleccionado === '2024' ? m.avance2024 : m.avance2025;
    return avance >= 80;
  }).length;
  const metasMedioAvance = metas.filter(m => {
    const avance = añoSeleccionado === '2024' ? m.avance2024 : m.avance2025;
    return avance >= 50 && avance < 80;
  }).length;
  const metasBajoAvance = metas.filter(m => {
    const avance = añoSeleccionado === '2024' ? m.avance2024 : m.avance2025;
    return avance < 50;
  }).length;

  const programasUnicos = Array.from(new Set(metas.map(m => m.programa)));
  const estadosUnicos = Array.from(new Set(metas.map(m => m.estado)));

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <PageMeta title="Metas de Producto | Dashboard Tenjo" description="Análisis y seguimiento de metas por producto del Plan de Desarrollo" />
      
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Metas de Producto
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Análisis y seguimiento de metas por producto del Plan de Desarrollo
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Metas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalMetas}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avance Alto (≥80%)</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {metasAltoAvance}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avance Medio (50-79%)</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {metasMedioAvance}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avance Bajo (&lt;50%)</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {metasBajoAvance}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <svg className="w-6 h-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <ComponentCard title="Filtros">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Búsqueda
              </label>
              <input
                type="text"
                placeholder="Buscar meta o responsable..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Año
              </label>
              <select
                value={añoSeleccionado}
                onChange={(e) => setAñoSeleccionado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Programa
              </label>
              <select
                value={programaSeleccionado}
                onChange={(e) => setProgramaSeleccionado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los programas</option>
                {programasUnicos.map(programa => (
                  <option key={programa} value={programa}>{programa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                {estadosUnicos.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
          </div>
        </ComponentCard>

        {/* Tabla de Metas */}
        <ComponentCard title={`Metas de Producto (${metasFiltradas.length})`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Meta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Programa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Avance {añoSeleccionado}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {metasFiltradas.map((meta) => {
                  const avance = añoSeleccionado === '2024' ? meta.avance2024 : meta.avance2025;
                  return (
                    <tr key={meta.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-md">
                        {meta.meta}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {meta.programa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {meta.responsable}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {avance}%
                          </span>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                avance >= 80 ? 'bg-green-500' :
                                avance >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${avance}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            meta.estado === 'Cumplido'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : meta.estado === 'En proceso'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                          }`}
                        >
                          {meta.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          to={`/metas-producto/${meta.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default MetasProductoPage;

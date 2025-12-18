import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

interface MetaDetalle {
  id: number;
  meta: string;
  programa: string;
  estadoEvaluacion: string;
  estado: string;
  responsable: string;
  avance2024: number;
  avance2025: number;
  descripcion: string;
  objetivo: string;
  indicador: string;
  linea_base: string;
  meta_2024: string;
  meta_2025: string;
  presupuesto_2024: number;
  presupuesto_2025: number;
  ejecutado_2024: number;
  ejecutado_2025: number;
  trimestres: {
    t1: { planificado: number; ejecutado: number };
    t2: { planificado: number; ejecutado: number };
    t3: { planificado: number; ejecutado: number };
    t4: { planificado: number; ejecutado: number };
  };
}

const MetaDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<MetaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'general' | 'trimestres' | 'financiero'>('general');

  const cargarDetalleMeta = async () => {
    try {
      setLoading(true);
      // Aquí se conectará con la API real
      // const response = await fetch(`/api/metas-producto/${id}`);
      // const data = await response.json();
      
      // Datos de ejemplo
      const datoEjemplo: MetaDetalle = {
        id: Number(id),
        meta: 'Implementar sistema de gestión documental',
        programa: 'Modernización Administrativa',
        estadoEvaluacion: 'En evaluación',
        estado: 'En proceso',
        responsable: 'Juan Pérez',
        avance2024: 85,
        avance2025: 45,
        descripcion: 'Implementación de un sistema integral de gestión documental para mejorar la eficiencia administrativa',
        objetivo: 'Digitalizar y optimizar los procesos documentales del municipio',
        indicador: 'Porcentaje de documentos digitalizados',
        linea_base: '20% de documentos digitalizados',
        meta_2024: '80% de documentos digitalizados',
        meta_2025: '100% de documentos digitalizados',
        presupuesto_2024: 150000000,
        presupuesto_2025: 180000000,
        ejecutado_2024: 127500000,
        ejecutado_2025: 81000000,
        trimestres: {
          t1: { planificado: 25, ejecutado: 28 },
          t2: { planificado: 25, ejecutado: 22 },
          t3: { planificado: 25, ejecutado: 24 },
          t4: { planificado: 25, ejecutado: 11 },
        },
      };
      
      setMeta(datoEjemplo);
      setError(null);
    } catch (err) {
      setError('Error al cargar los detalles de la meta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalleMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!meta) return <ErrorMessage message="Meta no encontrada" />;

  return (
    <>
      <PageMeta title={`${meta.meta} | Metas de Producto`} description={`Detalle de la meta: ${meta.meta}`} />
      
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/metas-producto"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {meta.meta}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Programa: {meta.programa}
              </p>
            </div>
          </div>
          
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              meta.estado === 'Cumplido'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : meta.estado === 'En proceso'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
            }`}
          >
            {meta.estado}
          </span>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setTabActiva('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tabActiva === 'general'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setTabActiva('trimestres')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tabActiva === 'trimestres'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Avance Trimestral
            </button>
            <button
              onClick={() => setTabActiva('financiero')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tabActiva === 'financiero'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Información Financiera
            </button>
          </nav>
        </div>

        {/* Contenido de las tabs */}
        {tabActiva === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComponentCard title="Descripción">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Meta</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{meta.meta}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{meta.descripcion}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Objetivo</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{meta.objetivo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Responsable</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{meta.responsable}</p>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Indicadores y Metas">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Indicador</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{meta.indicador}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Línea Base</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{meta.linea_base}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Meta 2024</label>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-blue-500 h-4 rounded-full"
                        style={{ width: `${meta.avance2024}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {meta.avance2024}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{meta.meta_2024}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Meta 2025</label>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-green-500 h-4 rounded-full"
                        style={{ width: `${meta.avance2025}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {meta.avance2025}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{meta.meta_2025}</p>
                </div>
              </div>
            </ComponentCard>
          </div>
        )}

        {tabActiva === 'trimestres' && (
          <ComponentCard title="Avance Trimestral 2025">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Trimestre
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Planificado (%)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Ejecutado (%)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Cumplimiento
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(meta.trimestres).map(([trimestre, datos]) => {
                    const cumplimiento = ((datos.ejecutado / datos.planificado) * 100).toFixed(1);
                    return (
                      <tr key={trimestre} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          Trimestre {trimestre.substring(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                          {datos.planificado}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                          {datos.ejecutado}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              Number(cumplimiento) >= 90
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : Number(cumplimiento) >= 70
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }`}
                          >
                            {cumplimiento}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ComponentCard>
        )}

        {tabActiva === 'financiero' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComponentCard title="Presupuesto 2024">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Presupuestado</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(meta.presupuesto_2024)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ejecutado</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(meta.ejecutado_2024)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">% Ejecución</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {((meta.ejecutado_2024 / meta.presupuesto_2024) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${(meta.ejecutado_2024 / meta.presupuesto_2024) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Presupuesto 2025">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Presupuestado</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(meta.presupuesto_2025)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ejecutado</span>
                  <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(meta.ejecutado_2025)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">% Ejecución</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {((meta.ejecutado_2025 / meta.presupuesto_2025) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${(meta.ejecutado_2025 / meta.presupuesto_2025) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        )}
      </div>
    </>
  );
};

export default MetaDetallePage;

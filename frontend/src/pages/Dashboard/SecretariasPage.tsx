import { useState, useEffect, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { obtenerSecretarias } from '../../lib/api';
import type { Secretaria } from '../../types/secretaria';
import { formatPercent, formatCurrency, getColorForPercentage } from '../../lib/formatters';

const SecretariasPage = () => {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroResponsable, setFiltroResponsable] = useState<string>('todos');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos de secretarías...');
      const data = await obtenerSecretarias();
      console.log('✅ Datos recibidos:', data);
      setSecretarias(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error al cargar secretarías:', err);
      setError('Error al cargar los datos de secretarías. Por favor, verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const responsables = useMemo(() => {
    const unique = new Set(secretarias
      .map(s => s.responsable?.trim())
      .filter(r => r && r !== 'TOTAL' && r !== 'TOTALES')
    );
    return Array.from(unique).sort();
  }, [secretarias]);

  const datosFiltrados = useMemo(() => {
    // Siempre excluimos el TOTAL de las gráficas y la tabla
    let filtrados = secretarias.filter(s => {
      const resp = s.responsable?.trim();
      return resp !== 'TOTAL' && resp !== 'TOTALES';
    });
    
    if (filtroResponsable !== 'todos') {
      filtrados = filtrados.filter(s => s.responsable?.trim() === filtroResponsable);
    }
    return filtrados;
  }, [secretarias, filtroResponsable]);

  const datosOrdenados = useMemo(() => {
    return [...datosFiltrados].sort((a, b) => b.apropiacionDefinitiva2025 - a.apropiacionDefinitiva2025);
  }, [datosFiltrados]);

  const kpis = useMemo(() => {
    // Si estamos viendo "todos", usamos la fila TOTAL que viene de la hoja
    if (filtroResponsable === 'todos') {
      const totalRow = secretarias.find(s => {
        const resp = s.responsable?.trim();
        return resp === 'TOTAL' || resp === 'TOTALES';
      });
      
      if (totalRow) {
        return {
          totalDefinitiva: totalRow.apropiacionDefinitiva2025,
          totalCompromisos: totalRow.compromisos2025,
          totalPagos: totalRow.pagos2025,
          promedioEjecucion: totalRow.porcentajeEjecucion,
          totalMetas: totalRow.totalMetas
        };
      }
    }

    // Si hay un filtro específico, usamos los datos de esa secretaría
    const totalDefinitiva = datosFiltrados.reduce((sum, s) => sum + s.apropiacionDefinitiva2025, 0);
    const totalCompromisos = datosFiltrados.reduce((sum, s) => sum + s.compromisos2025, 0);
    const totalPagos = datosFiltrados.reduce((sum, s) => sum + s.pagos2025, 0);
    const promedioEjecucion = datosFiltrados.length > 0 
      ? datosFiltrados.reduce((sum, s) => sum + s.porcentajeEjecucion, 0) / datosFiltrados.length 
      : 0;
    const totalMetas = datosFiltrados.reduce((sum, s) => sum + s.totalMetas, 0);

    return {
      totalDefinitiva,
      totalCompromisos,
      totalPagos,
      promedioEjecucion,
      totalMetas
    };
  }, [secretarias, datosFiltrados, filtroResponsable]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <PageMeta title="Secretarías | Dashboard Tenjo" description="Seguimiento por dependencias y secretarías" />
      
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión por Secretarías 2025
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Resumen presupuestal y de metas por dependencia
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filtroResponsable}
              onChange={(e) => setFiltroResponsable(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todas las Secretarías</option>
              {responsables.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              onClick={cargarDatos}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Presupuesto Definitivo</p>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400">
                <span className="text-xl">💰</span>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(kpis.totalDefinitiva)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Compromisos</p>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <span className="text-xl">📋</span>
              </div>
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(kpis.totalCompromisos)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Pagos</p>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <span className="text-xl">💵</span>
              </div>
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(kpis.totalPagos)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">% Ejecución Promedio</p>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                <span className="text-xl">📈</span>
              </div>
            </div>
            <p className={`text-xl font-bold ${getColorForPercentage(kpis.promedioEjecucion).text}`}>
              {formatPercent(kpis.promedioEjecucion)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Total Metas</p>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                <span className="text-xl">🎯</span>
              </div>
            </div>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{kpis.totalMetas}</p>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComponentCard title="Presupuesto: Inicial vs Definitivo">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosOrdenados.slice(0, 8)} margin={{ bottom: 60, left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="responsable" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0}
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="apropiacionInicial2025" name="Inicial" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="apropiacionDefinitiva2025" name="Definitivo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ComponentCard>

          <ComponentCard title="Ejecución: Compromisos vs Pagos">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosOrdenados.slice(0, 8)} margin={{ bottom: 60, left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="responsable" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0}
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="compromisos2025" name="Compromisos" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pagos2025" name="Pagos" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ComponentCard>

          <ComponentCard title="% Ejecución Presupuestal (Top 10)">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[...datosFiltrados].sort((a, b) => b.porcentajeEjecucion - a.porcentajeEjecucion).slice(0, 10)}
                  margin={{ bottom: 60, left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="responsable" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0}
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => formatPercent(v)} />
                  <Bar dataKey="porcentajeEjecucion" name="% Ejecución">
                    {[...datosFiltrados].sort((a, b) => b.porcentajeEjecucion - a.porcentajeEjecucion).slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorForPercentage(entry.porcentajeEjecucion).hex} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ComponentCard>

          <ComponentCard title="Metas Programadas 2025 (Top 10)">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[...datosFiltrados].sort((a, b) => b.metasProgramadas2025 - a.metasProgramadas2025).slice(0, 10)}
                  margin={{ bottom: 60, left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="responsable" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0}
                    height={80}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="metasProgramadas2025" name="Metas Programadas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ComponentCard>
        </div>

        {/* Tabla Detallada */}
        <ComponentCard title="Detalle de Ejecución por Dependencia">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Metas (Tot/Prog)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Presupuesto Def.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Compromisos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pagos</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">% Ejecución</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {datosOrdenados.map((sec, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {sec.responsable}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                      {sec.totalMetas} / {sec.metasProgramadas2025}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(sec.apropiacionDefinitiva2025)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                      {formatCurrency(sec.compromisos2025)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                      {formatCurrency(sec.pagos2025)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getColorForPercentage(sec.porcentajeEjecucion).bg} ${getColorForPercentage(sec.porcentajeEjecucion).text}`}>
                        {formatPercent(sec.porcentajeEjecucion)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default SecretariasPage;

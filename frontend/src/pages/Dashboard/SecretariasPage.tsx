import { useState, useEffect, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { obtenerSecretarias, obtenerMetasProducto } from '../../lib/api';
import type { Secretaria } from '../../types/secretaria';
import type { MetaProducto } from '../../types/metaProducto';
import { formatPercent, formatCurrency, getColorForPercentage, formatNumber } from '../../lib/formatters';

const SecretariasPage = () => {
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [metas, setMetas] = useState<MetaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroResponsable, setFiltroResponsable] = useState<string>('todos');
  const [vistaTabla, setVistaTabla] = useState<'dependencia' | 'meta'>('dependencia');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos de secretarías...');
      const [dataSecretarias, dataMetas] = await Promise.all([
        obtenerSecretarias(),
        obtenerMetasProducto()
      ]);
      console.log('✅ Datos recibidos - Secretarías:', dataSecretarias);
      console.log('✅ Datos recibidos - Metas:', dataMetas);
      setSecretarias(dataSecretarias || []);
      setMetas(dataMetas || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, verifica la conexión con el servidor.');
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

  const metasFiltradas = useMemo(() => {
    if (filtroResponsable === 'todos') {
      return metas;
    }
    return metas.filter(m => m.responsable?.trim() === filtroResponsable);
  }, [metas, filtroResponsable]);

  const kpis = useMemo(() => {
    // Si estamos viendo "todos", usamos la fila TOTAL que viene de la hoja
    if (filtroResponsable === 'todos') {
      const totalRow = secretarias.find(s => {
        const resp = s.responsable?.trim();
        return resp === 'TOTAL' || resp === 'TOTALES';
      });
      
      if (totalRow) {
        // Calcular el porcentaje de ejecución basado en totales
        const porcentajeCalculado = totalRow.apropiacionDefinitiva2025 > 0 
          ? (totalRow.compromisos2025 / totalRow.apropiacionDefinitiva2025) * 100 
          : 0;
        
        return {
          totalDefinitiva: totalRow.apropiacionDefinitiva2025,
          totalCompromisos: totalRow.compromisos2025,
          totalPagos: totalRow.pagos2025,
          promedioEjecucion: porcentajeCalculado,
          totalMetas: totalRow.totalMetas
        };
      }
    }

    // Si hay un filtro específico, usamos los datos de esa secretaría
    const totalDefinitiva = datosFiltrados.reduce((sum, s) => sum + s.apropiacionDefinitiva2025, 0);
    const totalCompromisos = datosFiltrados.reduce((sum, s) => sum + s.compromisos2025, 0);
    const totalPagos = datosFiltrados.reduce((sum, s) => sum + s.pagos2025, 0);
    // Calcular el porcentaje de ejecución basado en totales
    const promedioEjecucion = totalDefinitiva > 0 
      ? (totalCompromisos / totalDefinitiva) * 100 
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

          <ComponentCard title="Ejecución Presupuestal 2025 (Top 10)">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[...datosFiltrados].sort((a, b) => b.porcentajeEjecucion - a.porcentajeEjecucion).slice(0, 10)}
                  margin={{ bottom: 60, left: 20, right: 20 }}
                  layout="horizontal"
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
                  <YAxis 
                    tickFormatter={(v) => `${v.toFixed(0)}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(v: number) => formatPercent(v)}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend verticalAlign="top" />
                  <Bar dataKey="porcentajeEjecucion" name="% Ejecución" radius={[4, 4, 0, 0]}>
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
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header con selector */}
          <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Detalle de Ejecución {vistaTabla === 'dependencia' ? 'por Dependencia' : 'por Meta'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVistaTabla('dependencia')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  vistaTabla === 'dependencia'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Por Dependencia
              </button>
              <button
                onClick={() => setVistaTabla('meta')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  vistaTabla === 'meta'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Por Meta
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <div className="overflow-x-auto">
              {vistaTabla === 'dependencia' ? (
                /* Tabla por Dependencia */
                <>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Responsable
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Metas<br/><span className="text-[10px] normal-case">(Total / Programadas)</span>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Presupuesto<br/><span className="text-[10px] normal-case">Definitivo 2025</span>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Compromisos<br/><span className="text-[10px] normal-case">2025</span>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Pagos<br/><span className="text-[10px] normal-case">2025</span>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          % Ejecución
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {datosOrdenados.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No hay datos disponibles para mostrar
                          </td>
                        </tr>
                      ) : (
                        datosOrdenados.map((sec, index) => {
                          const colorEjecucion = getColorForPercentage(sec.porcentajeEjecucion);
                          return (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                <div className="max-w-xs truncate" title={sec.responsable}>
                                  {sec.responsable}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                <span className="text-gray-900 dark:text-white font-semibold">{sec.totalMetas}</span>
                                <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
                                <span className="text-gray-600 dark:text-gray-400">{sec.metasProgramadas2025}</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                                {formatCurrency(sec.apropiacionDefinitiva2025)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400">
                                {formatCurrency(sec.compromisos2025)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                                {formatCurrency(sec.pagos2025)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${colorEjecucion.bg} ${colorEjecucion.text}`}>
                                    {formatPercent(sec.porcentajeEjecucion)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  {datosOrdenados.length > 0 && (
                    <div className="mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Total de registros:</span> {datosOrdenados.length} {filtroResponsable !== 'todos' ? 'secretaría' : 'secretarías'}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Tabla por Meta */
                <>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-900">
                          Meta
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Responsable
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total<br/>Planeado 2025
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ejecutado<br/>2025
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Avance<br/>2025
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          % Total<br/>Planeado 2025
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          % Total<br/>Avance 2025
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado<br/>Programado
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Apropiación<br/>Inicial 2025
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Apropiación<br/>Definitiva 2025
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Compromisos<br/>2025
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Pagos<br/>2025
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          % Ejecución<br/>2025
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {metasFiltradas.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            No hay metas disponibles para mostrar
                          </td>
                        </tr>
                      ) : (
                        metasFiltradas.map((meta, index) => {
                          const porcentajeEjecucion = typeof meta.ejecucion2025 === 'number' 
                            ? meta.ejecucion2025 
                            : parseFloat(String(meta.ejecucion2025 || '0').replace(/[^0-9.-]/g, '')) || 0;
                          const colorEjecucion = getColorForPercentage(porcentajeEjecucion);
                          
                          const porcentajePlaneado = typeof meta.porcentajeAvance2025 === 'number'
                            ? meta.porcentajeAvance2025
                            : parseFloat(String(meta.porcentajeAvance2025 || '0').replace(/[^0-9.-]/g, '')) || 0;
                          
                          return (
                            <tr key={meta.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-3 py-3 text-sm text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800">
                                <div className="max-w-xs truncate" title={meta.meta}>
                                  {meta.meta}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-700 dark:text-gray-300">
                                <div className="max-w-xs truncate" title={meta.responsable}>
                                  {meta.responsable}
                                </div>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                                {formatNumber(Number(meta.totalPlaneado2025 || 0), 1)}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400">
                                {formatNumber(Number(meta.totalEjecutado2025 || 0), 1)}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-purple-600 dark:text-purple-400">
                                {formatNumber(Number(meta.avance2025 || 0), 1)}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorForPercentage(porcentajePlaneado).bg} ${getColorForPercentage(porcentajePlaneado).text}`}>
                                  {formatPercent(porcentajePlaneado)}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorForPercentage(Number(meta.avance2025 || 0)).bg} ${getColorForPercentage(Number(meta.avance2025 || 0)).text}`}>
                                  {formatPercent(Number(meta.avance2025 || 0))}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-center text-sm">
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  meta.estadoProgramado2025 === 'PROGRAMADO' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {meta.estadoProgramado2025 || 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                                {formatCurrency(Number(meta.apropiacionInicial2025 || 0))}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                                {formatCurrency(Number(meta.apropiacionDefinitiva2025 || 0))}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400">
                                {formatCurrency(Number(meta.compromisos2025 || 0))}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                                {formatCurrency(Number(meta.pagos2025 || 0))}
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap text-center">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${colorEjecucion.bg} ${colorEjecucion.text}`}>
                                  {formatPercent(porcentajeEjecucion)}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  {metasFiltradas.length > 0 && (
                    <div className="mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Total de metas:</span> {metasFiltradas.length} {filtroResponsable !== 'todos' ? `de ${filtroResponsable}` : 'en total'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecretariasPage;

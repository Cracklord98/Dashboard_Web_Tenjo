import { useState, useEffect, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { obtenerMetasProducto } from '../../lib/api';
import type { MetaProducto } from '../../types/metaProducto';
import { formatCurrency, formatPercent, parseNumber, calculatePercentage, formatCompactNumber } from '../../lib/formatters';

interface DatosPrograma {
  nombre: string;
  apropiacionInicial: number;
  apropiacionDefinitiva: number;
  compromisos: number;
  pagos: number;
  metas: number;
  porcentajeEjecucion: number;
  porcentajePagos: number;
}

interface DatosEje {
  nombre: string;
  apropiacionInicial: number;
  apropiacionDefinitiva: number;
  compromisos: number;
  metas: number;
  porcentaje: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: {
      nombre?: string;
      anio?: string;
      metas?: number;
    };
  }>;
}

// Moved outside component to prevent re-renders
const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {payload[0].payload.nombre || payload[0].payload.anio}
        </p>
        {payload.map((entry, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
        {payload[0].payload.metas !== undefined && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total metas: <span className="font-semibold">{payload[0].payload.metas}</span>
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const EjecucionPresupuestal = () => {
  const [metas, setMetas] = useState<MetaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState<'2024' | '2025'>('2025');
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);
  
  // Filtros jerárquicos
  const [ejeSeleccionado, setEjeSeleccionado] = useState<string>('todos');
  const [programaSeleccionado, setProgramaSeleccionado] = useState<string>('todos');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const metas = await obtenerMetasProducto();
      setMetas(metas || []);
      setUltimaActualizacion(new Date());
      setMostrarNotificacion(true);
      setTimeout(() => setMostrarNotificacion(false), 3000);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos financieros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar metas según jerarquía seleccionada
  const metasFiltradas = useMemo(() => {
    let filtradas = metas;
    
    if (ejeSeleccionado !== 'todos') {
      filtradas = filtradas.filter(m => m.ejePrograma === ejeSeleccionado);
    }
    
    if (programaSeleccionado !== 'todos') {
      filtradas = filtradas.filter(m => m.programa === programaSeleccionado);
    }
    
    return filtradas;
  }, [metas, ejeSeleccionado, programaSeleccionado]);

  // Obtener opciones únicas para filtros
  const ejesDisponibles = useMemo(() => {
    const ejes = new Set(metas.map(m => m.ejePrograma).filter(Boolean));
    return Array.from(ejes).sort();
  }, [metas]);

  const programasDisponibles = useMemo(() => {
    let metasParaProgramas = metas;
    if (ejeSeleccionado !== 'todos') {
      metasParaProgramas = metas.filter(m => m.ejePrograma === ejeSeleccionado);
    }
    const programas = new Set(metasParaProgramas.map(m => m.programa).filter(Boolean));
    return Array.from(programas).sort();
  }, [metas, ejeSeleccionado]);

  // Procesar datos financieros
  const datosFinancieros = useMemo(() => {
    if (!metasFiltradas.length) return null;

    // KPIs generales del año seleccionado
    const apropiacionInicialKey = (añoSeleccionado === '2025' ? 'apropiacionInicial2025' : 'apropiacion2024') as keyof MetaProducto;
    const apropiacionDefinitivaKey = (añoSeleccionado === '2025' ? 'apropiacionDefinitiva2025' : 'apropiacion2024') as keyof MetaProducto;
    const compromisosKey = (añoSeleccionado === '2025' ? 'compromisos2025' : 'compromisos2024') as keyof MetaProducto;
    const pagosKey = (añoSeleccionado === '2025' ? 'pagos2025' : 'pagos2024') as keyof MetaProducto;

    const totalApropiacionInicial = metasFiltradas.reduce((sum, m: MetaProducto) => sum + parseNumber(m[apropiacionInicialKey]), 0);
    const totalApropiacionDefinitiva = metasFiltradas.reduce((sum, m: MetaProducto) => sum + parseNumber(m[apropiacionDefinitivaKey]), 0);
    const totalCompromisos = metasFiltradas.reduce((sum, m: MetaProducto) => sum + parseNumber(m[compromisosKey]), 0);
    const totalPagos = metasFiltradas.reduce((sum, m: MetaProducto) => sum + parseNumber(m[pagosKey]), 0);
    const porcentajeEjecucion = calculatePercentage(totalCompromisos, totalApropiacionDefinitiva);

    // Datos por programa
    const datosPorPrograma = metasFiltradas.reduce((acc: DatosPrograma[], meta: MetaProducto) => {
      const programa = meta.programa || 'Sin programa';
      const existe = acc.find(p => p.nombre === programa);

      const apropiacionInicial = parseNumber(meta[apropiacionInicialKey]);
      const apropiacionDefinitiva = parseNumber(meta[apropiacionDefinitivaKey]);
      const compromisos = parseNumber(meta[compromisosKey]);
      const pagos = parseNumber(meta[pagosKey]);

      if (existe) {
        existe.apropiacionInicial += apropiacionInicial;
        existe.apropiacionDefinitiva += apropiacionDefinitiva;
        existe.compromisos += compromisos;
        existe.pagos += pagos;
        existe.metas += 1;
      } else {
        acc.push({
          nombre: programa,
          apropiacionInicial,
          apropiacionDefinitiva,
          compromisos,
          pagos,
          metas: 1,
          porcentajeEjecucion: 0,
          porcentajePagos: 0,
        });
      }

      return acc;
    }, []);

    // Calcular porcentajes
    datosPorPrograma.forEach(p => {
      p.porcentajeEjecucion = calculatePercentage(p.compromisos, p.apropiacionDefinitiva);
      p.porcentajePagos = calculatePercentage(p.pagos, p.compromisos);
    });

    // Ordenar por apropiación definitiva
    datosPorPrograma.sort((a, b) => b.apropiacionDefinitiva - a.apropiacionDefinitiva);

    // Datos por eje
    const datosPorEje = metasFiltradas.reduce((acc: DatosEje[], meta: MetaProducto) => {
      const eje = meta.ejePrograma || 'Sin eje';
      const existe = acc.find(e => e.nombre === eje);

      const apropiacionInicial = parseNumber(meta[apropiacionInicialKey]);
      const apropiacionDefinitiva = parseNumber(meta[apropiacionDefinitivaKey]);
      const compromisos = parseNumber(meta[compromisosKey]);

      if (existe) {
        existe.apropiacionInicial += apropiacionInicial;
        existe.apropiacionDefinitiva += apropiacionDefinitiva;
        existe.compromisos += compromisos;
        existe.metas += 1;
      } else {
        acc.push({ nombre: eje, apropiacionInicial, apropiacionDefinitiva, compromisos, metas: 1, porcentaje: 0 });
      }

      return acc;
    }, []);

    datosPorEje.forEach(e => {
      e.porcentaje = calculatePercentage(e.compromisos, e.apropiacionDefinitiva);
    });

    return {
      kpis: {
        totalApropiacionInicial,
        totalApropiacionDefinitiva,
        totalCompromisos,
        totalPagos,
        porcentajeEjecucion,
        saldoDisponible: totalApropiacionDefinitiva - totalCompromisos,
        totalMetas: metasFiltradas.length,
      },
      porPrograma: datosPorPrograma,
      porEje: datosPorEje,
    };
  }, [metasFiltradas, añoSeleccionado]);

  // Comparación 2024 vs 2025
  const comparacionAnual = useMemo(() => {
    if (!metasFiltradas.length) return [];

    const datos2024 = metasFiltradas.reduce((acc: { apropiacion: number; compromisos: number }, m: MetaProducto) => ({
      apropiacion: acc.apropiacion + parseNumber(m['apropiacion2024' as keyof MetaProducto]),
      compromisos: acc.compromisos + parseNumber(m['compromisos2024' as keyof MetaProducto]),
    }), { apropiacion: 0, compromisos: 0 });

    const datos2025 = metasFiltradas.reduce((acc: { apropiacion: number; compromisos: number }, m: MetaProducto) => ({
      apropiacion: acc.apropiacion + parseNumber(m.apropiacionDefinitiva2025),
      compromisos: acc.compromisos + parseNumber(m.compromisos2025),
    }), { apropiacion: 0, compromisos: 0 });

    return [
      {
        anio: '2024',
        apropiacion: datos2024.apropiacion,
        compromisos: datos2024.compromisos,
        porcentaje: calculatePercentage(datos2024.compromisos, datos2024.apropiacion),
      },
      {
        anio: '2025',
        apropiacion: datos2025.apropiacion,
        compromisos: datos2025.compromisos,
        porcentaje: calculatePercentage(datos2025.compromisos, datos2025.apropiacion),
      },
    ];
  }, [metasFiltradas]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={cargarDatos} />;
  if (!datosFinancieros) return <ErrorMessage message="No hay datos disponibles" />;

  const { kpis, porPrograma, porEje } = datosFinancieros;
  const top10Programas = porPrograma.slice(0, 10);

  return (
    <>
      <PageMeta 
        title={`Ejecución Presupuestal ${añoSeleccionado} | Dashboard Tenjo`} 
        description="Análisis detallado de la ejecución presupuestal municipal"
      />
      
      <div className="space-y-6">
        {/* Notificación de actualización */}
        {mostrarNotificacion && (
          <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold">Datos actualizados</p>
                <p className="text-sm opacity-90">{metas.length} metas cargadas</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Ejecución Presupuestal {añoSeleccionado}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {kpis.totalMetas} metas de producto • {metasFiltradas.length} filtradas
                {ultimaActualizacion && (
                  <span className="ml-2 text-xs">
                    • Actualizado: {ultimaActualizacion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={cargarDatos}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 self-start md:self-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>

          {/* Filtros Jerárquicos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📅 Año
                </label>
                <select
                  value={añoSeleccionado}
                  onChange={(e) => setAñoSeleccionado(e.target.value as '2024' | '2025')}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🎯 Eje del PDM
                </label>
                <select
                  value={ejeSeleccionado}
                  onChange={(e) => {
                    setEjeSeleccionado(e.target.value);
                    setProgramaSeleccionado('todos');
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">📊 Todos los Ejes ({ejesDisponibles.length})</option>
                  {ejesDisponibles.map(eje => (
                    <option key={eje} value={eje}>{eje.replace('Eje ', '')}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📂 Programa PDT
                </label>
                <select
                  value={programaSeleccionado}
                  onChange={(e) => setProgramaSeleccionado(e.target.value)}
                  disabled={ejeSeleccionado === 'todos'}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="todos">Todos los Programas ({programasDisponibles.length})</option>
                  {programasDisponibles.map(programa => (
                    <option key={programa} value={programa}>{programa}</option>
                  ))}
                </select>
              </div>

              {(ejeSeleccionado !== 'todos' || programaSeleccionado !== 'todos') && (
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setEjeSeleccionado('todos');
                      setProgramaSeleccionado('todos');
                    }}
                    className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Limpiar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
          <div className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Metas de Producto</p>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-2xl font-bold break-words">{kpis.totalMetas.toLocaleString('es-CO')}</p>
            <p className="text-xs opacity-75 mt-1">total filtradas</p>
          </div>

          <div className="bg-linear-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Apropiación Inicial {añoSeleccionado}</p>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-lg font-bold break-words leading-tight">{formatCurrency(kpis.totalApropiacionInicial)}</p>
          </div>

          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Apropiación Definitiva {añoSeleccionado}</p>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold break-words leading-tight">{formatCurrency(kpis.totalApropiacionDefinitiva)}</p>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Compromisos {añoSeleccionado}</p>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold break-words leading-tight">{formatCurrency(kpis.totalCompromisos)}</p>
          </div>

          <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Pagos {añoSeleccionado}</p>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-lg font-bold break-words leading-tight">{formatCurrency(kpis.totalPagos)}</p>
          </div>

          <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">% Ejecución Presupuestal {añoSeleccionado}</p>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <p className="text-2xl font-bold break-words">{formatPercent(kpis.porcentajeEjecucion, 1)}</p>
            <p className="text-xs opacity-75 mt-1">Compromisos / Apropiación Definitiva</p>
          </div>

          <div className="bg-linear-to-br from-gray-600 to-gray-700 rounded-xl shadow-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium opacity-90">Saldo Disponible {añoSeleccionado}</p>
              <svg className="w-6 h-6 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-lg font-bold break-words leading-tight">{formatCurrency(kpis.saldoDisponible)}</p>
          </div>
        </div>

        {/* Comparación Anual */}
        <ComponentCard title="Comparación 2024 vs 2025 (COP)">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparacionAnual}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="anio" className="text-sm" />
              <YAxis tickFormatter={(value) => formatCompactNumber(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="apropiacion" fill="#3b82f6" name="Apropiación" radius={[8, 8, 0, 0]} />
              <Bar dataKey="compromisos" fill="#10b981" name="Compromisos" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ComponentCard>

        {/* Gráficos lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 Programas */}
          <ComponentCard title="Top 10 Programas PDT por Presupuesto (COP)">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={top10Programas} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis type="number" tickFormatter={(value) => formatCompactNumber(value)} />
                <YAxis dataKey="nombre" type="category" hide />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} wrapperStyle={{ zIndex: 1000 }} />
                <Legend />
                <Bar dataKey="apropiacionInicial" fill="#06b6d4" name="Apropiación Inicial" />
                <Bar dataKey="apropiacionDefinitiva" fill="#3b82f6" name="Apropiación Definitiva" />
                <Bar dataKey="compromisos" fill="#10b981" name="Compromisos" />
              </BarChart>
            </ResponsiveContainer>
          </ComponentCard>

          {/* Distribución por Eje */}
          <ComponentCard title="Distribución Presupuestal por Eje del PDM (COP)">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={porEje}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  nameKey="nombre"
                  label={({ name, percent }) => {
                    const labelName = String(name || 'Sin nombre');
                    const displayName = labelName.length > 20 ? labelName.substring(0, 20) + '...' : labelName;
                    return `${displayName} ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="apropiacionDefinitiva"
                >
                  {porEje.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
              </PieChart>
            </ResponsiveContainer>
          </ComponentCard>
        </div>

        {/* Tabla Detallada */}
        <ComponentCard title={`Detalle por Programa PDT - ${añoSeleccionado} (COP)`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Programa PDT
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Metas Producto
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Apropiación Inicial
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Apropiación Definitiva
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Compromisos
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pagos
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % Ejecución
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {porPrograma.map((programa, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-xs wrap-break-word" title={programa.nombre}>
                      {programa.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {programa.metas}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right">
                      {formatCurrency(programa.apropiacionInicial)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right font-medium">
                      {formatCurrency(programa.apropiacionDefinitiva)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right">
                      {formatCurrency(programa.compromisos)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right">
                      {formatCurrency(programa.pagos)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (programa.porcentajeEjecucion ?? 0) >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        (programa.porcentajeEjecucion ?? 0) >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        (programa.porcentajeEjecucion ?? 0) >= 50 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {formatPercent(programa.porcentajeEjecucion ?? 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                      {formatCurrency(programa.apropiacionDefinitiva - programa.compromisos)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 dark:bg-gray-900">
                <tr className="font-bold">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    TOTAL
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                    {kpis.totalMetas}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                    {formatCurrency(kpis.totalApropiacionInicial)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                    {formatCurrency(kpis.totalApropiacionDefinitiva)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                    {formatCurrency(kpis.totalCompromisos)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                    {formatCurrency(kpis.totalPagos)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                    {formatPercent(kpis.porcentajeEjecucion)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                    {formatCurrency(kpis.saldoDisponible)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default EjecucionPresupuestal;

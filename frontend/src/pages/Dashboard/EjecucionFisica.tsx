import { useState, useEffect, useMemo } from 'react';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { obtenerMetasProducto } from '../../lib/api';
import type { MetaProducto } from '../../types/metaProducto';
import { formatPercent, parseNumber, calculatePercentage, getColorForPercentage } from '../../lib/formatters';

// Custom Tooltip Component
interface TooltipPayload {
  payload: { nombre?: string; name?: string; metas?: number };
  color: string;
  name: string;
  value: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
      <p className="font-semibold text-gray-900 dark:text-white mb-2">{payload[0].payload.nombre || payload[0].payload.name}</p>
      {payload[0].payload.metas && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          📊 {payload[0].payload.metas} metas de producto
        </p>
      )}
      {payload.map((entry, index: number) => (
        <div key={index} className="flex items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">{entry.name}:</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {typeof entry.value === 'number' ? entry.value.toFixed(0) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

type NivelVisualizacion = 'eje' | 'programa' | 'subprograma' | 'meta';

const EjecucionFisica = () => {
  const [metas, setMetas] = useState<MetaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState<'2024' | '2025'>('2025');
  
  // Filtros jerárquicos
  const [ejeSeleccionado, setEjeSeleccionado] = useState<string>('todos');
  const [programaSeleccionado, setProgramaSeleccionado] = useState<string>('todos');
  
  // Nivel de visualización de la tabla
  const [nivelTabla, setNivelTabla] = useState<NivelVisualizacion>('programa');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await obtenerMetasProducto();
      console.log('✅ Metas cargadas (Física):', data.length);
      setMetas(data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos de ejecución física');
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

    console.log(`📊 Metas filtradas (Física): ${filtradas.length} de ${metas.length}`);
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

  // Procesar datos físicos
  const datosFisicos = useMemo(() => {
    if (!metasFiltradas.length) return null;

    const planeadoKey = añoSeleccionado === '2025' ? 'totalPlaneado2025' : 'totalPlaneado2024';
    const ejecutadoKey = añoSeleccionado === '2025' ? 'totalEjecutado2025' : 'totalEjecutado2024';

    // KPIs generales
    const totalPlanificadas = metasFiltradas.reduce((sum, m) => sum + parseNumber((m as Record<string, unknown>)[planeadoKey]), 0);
    const totalEjecutadas = metasFiltradas.reduce((sum, m) => sum + parseNumber((m as Record<string, unknown>)[ejecutadoKey]), 0);
    const porcentajeTotal = calculatePercentage(totalEjecutadas, totalPlanificadas);

    // Contar metas por estado
    const metasConEstado = metasFiltradas.map((meta) => {
      const metaRecord = meta as Record<string, unknown>;
      const planeado = parseNumber(metaRecord[planeadoKey]);
      const ejecutado = parseNumber(metaRecord[ejecutadoKey]);
      const porcentaje = calculatePercentage(ejecutado, planeado);
      
      let estado = 'Pendiente';
      if (porcentaje >= 90) estado = 'Cumplida';
      else if (porcentaje >= 50) estado = 'En Proceso';
      
      return { ...meta, estado, porcentaje };
    });

    const cumplidas = metasConEstado.filter(m => m.estado === 'Cumplida').length;
    const enProceso = metasConEstado.filter(m => m.estado === 'En Proceso').length;
    const pendientes = metasConEstado.filter(m => m.estado === 'Pendiente').length;

    // Datos agregados según nivel seleccionado
    interface DatoTabla {
      nombre: string;
      planificadas: number;
      ejecutadas: number;
      porcentaje: number;
      metas: number;
    }
    
    let datosTabla: DatoTabla[] = [];
    
    if (nivelTabla === 'eje') {
      const ejesMap = new Map<string, { planeado: number; ejecutado: number; metas: number }>();
      metasFiltradas.forEach((meta) => {
        const metaRecord = meta as Record<string, unknown>;
        const eje = meta.ejePrograma || 'Sin Eje';
        if (!ejesMap.has(eje)) {
          ejesMap.set(eje, { planeado: 0, ejecutado: 0, metas: 0 });
        }
        const current = ejesMap.get(eje)!;
        current.planeado += parseNumber(metaRecord[planeadoKey]);
        current.ejecutado += parseNumber(metaRecord[ejecutadoKey]);
        current.metas += 1;
      });
      datosTabla = Array.from(ejesMap.entries()).map(([nombre, data]) => ({
        nombre,
        planificadas: data.planeado,
        ejecutadas: data.ejecutado,
        porcentaje: calculatePercentage(data.ejecutado, data.planeado),
        metas: data.metas
      }));
    } else if (nivelTabla === 'programa') {
      const programasMap = new Map<string, { planeado: number; ejecutado: number; metas: number }>();
      metasFiltradas.forEach((meta) => {
        const metaRecord = meta as Record<string, unknown>;
        const programa = meta.programa || 'Sin Programa';
        if (!programasMap.has(programa)) {
          programasMap.set(programa, { planeado: 0, ejecutado: 0, metas: 0 });
        }
        const current = programasMap.get(programa)!;
        current.planeado += parseNumber(metaRecord[planeadoKey]);
        current.ejecutado += parseNumber(metaRecord[ejecutadoKey]);
        current.metas += 1;
      });
      datosTabla = Array.from(programasMap.entries()).map(([nombre, data]) => ({
        nombre,
        planificadas: data.planeado,
        ejecutadas: data.ejecutado,
        porcentaje: calculatePercentage(data.ejecutado, data.planeado),
        metas: data.metas
      }));
    } else if (nivelTabla === 'subprograma') {
      const subprogramasMap = new Map<string, { planeado: number; ejecutado: number; metas: number }>();
      metasFiltradas.forEach((meta) => {
        const metaRecord = meta as Record<string, unknown>;
        const subprograma = meta.subPrograma || 'Sin Subprograma';
        if (!subprogramasMap.has(subprograma)) {
          subprogramasMap.set(subprograma, { planeado: 0, ejecutado: 0, metas: 0 });
        }
        const current = subprogramasMap.get(subprograma)!;
        current.planeado += parseNumber(metaRecord[planeadoKey]);
        current.ejecutado += parseNumber(metaRecord[ejecutadoKey]);
        current.metas += 1;
      });
      datosTabla = Array.from(subprogramasMap.entries()).map(([nombre, data]) => ({
        nombre,
        planificadas: data.planeado,
        ejecutadas: data.ejecutado,
        porcentaje: calculatePercentage(data.ejecutado, data.planeado),
        metas: data.metas
      }));
    } else {
      // Nivel meta - mostrar cada meta individualmente
      datosTabla = metasFiltradas.map((meta) => {
        const metaRecord = meta as Record<string, unknown>;
        // Construir nombre más descriptivo
        let nombre = meta.metaProducto || meta.metaResultado || meta.nombreProyecto || '';
        if (!nombre && meta.programa) {
          nombre = `${meta.programa} - Meta ${meta.codigo || ''}`;
        }
        if (!nombre) nombre = 'Meta sin descripción';
        
        return {
          nombre: nombre.trim(),
          planificadas: parseNumber(metaRecord[planeadoKey]),
          ejecutadas: parseNumber(metaRecord[ejecutadoKey]),
          porcentaje: calculatePercentage(parseNumber(metaRecord[ejecutadoKey]), parseNumber(metaRecord[planeadoKey])),
          metas: 1
        };
      });
    }

    datosTabla.sort((a, b) => b.planificadas - a.planificadas);

    // Top 10 para gráficas
    const top10 = datosTabla.slice(0, 10);

    // Datos para gráfica de estado
    const datosEstado = [
      { name: 'Cumplidas', value: cumplidas, color: '#10b981' },
      { name: 'En Proceso', value: enProceso, color: '#f59e0b' },
      { name: 'Pendientes', value: pendientes, color: '#ef4444' },
    ].filter(d => d.value > 0);

    return {
      datosTabla,
      top10,
      datosEstado,
      totalPlanificadas,
      totalEjecutadas,
      porcentajeTotal,
      cumplidas,
      enProceso,
      pendientes,
      totalMetas: metasFiltradas.length
    };
  }, [metasFiltradas, añoSeleccionado, nivelTabla]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!datosFisicos) return <ErrorMessage message="No hay datos disponibles" />;

  const { datosTabla, top10, datosEstado, totalPlanificadas, totalEjecutadas, porcentajeTotal, cumplidas, enProceso, totalMetas } = datosFisicos;

  const getNivelLabel = () => {
    switch (nivelTabla) {
      case 'eje': return 'Eje del PDM';
      case 'programa': return 'Programa PDT';
      case 'subprograma': return 'Subprograma';
      case 'meta': return 'Meta de Producto';
      default: return 'Item';
    }
  };

  return (
    <>
      <PageMeta title="Ejecución Física | Dashboard Tenjo" description="Seguimiento del cumplimiento de metas y actividades" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Ejecución Física {añoSeleccionado}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalMetas} metas de producto • {metasFiltradas.length} filtradas
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

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📊 Nivel de Detalle Tabla
                </label>
                <select
                  value={nivelTabla}
                  onChange={(e) => setNivelTabla(e.target.value as NivelVisualizacion)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="eje">Por Eje del PDM</option>
                  <option value="programa">Por Programa PDT</option>
                  <option value="subprograma">Por Subprograma</option>
                  <option value="meta">Por Meta de Producto</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <div className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Metas de Producto</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{totalMetas.toLocaleString('es-CO')}</p>
            <p className="text-xs opacity-75 mt-2">total filtradas</p>
          </div>

          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Programadas</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{totalPlanificadas.toFixed(0)}</p>
            <p className="text-xs opacity-75 mt-2">actividades programadas</p>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Ejecutadas</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{totalEjecutadas.toFixed(0)}</p>
            <p className="text-xs opacity-75 mt-2">actividades completadas</p>
          </div>

          <div className={`bg-linear-to-br ${getColorForPercentage(porcentajeTotal).gradient} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">% Cumplimiento</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{formatPercent(porcentajeTotal)}</p>
            <p className="text-xs opacity-75 mt-2">Ejecutadas / Planificadas</p>
          </div>

          <div className="bg-linear-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Cumplidas</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{cumplidas}</p>
            <p className="text-xs opacity-75 mt-2">≥ 90% cumplimiento</p>
          </div>

          <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">En Proceso</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{enProceso}</p>
            <p className="text-xs opacity-75 mt-2">50% - 89% cumplimiento</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 10 */}
          <ComponentCard title={`Top 10 por ${getNivelLabel()}`}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={top10} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" hide />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="planificadas" fill="#3b82f6" name="Programadas" />
                <Bar dataKey="ejecutadas" fill="#10b981" name="Ejecutadas" />
              </BarChart>
            </ResponsiveContainer>
          </ComponentCard>

          {/* Estado de las Metas */}
          <ComponentCard title="Estado de las Metas de Producto">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={datosEstado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ComponentCard>
        </div>

        {/* Tabla Detallada con Profundidad Configurable */}
        <ComponentCard title={`Detalle por ${getNivelLabel()} - ${añoSeleccionado}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {getNivelLabel()}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Metas Producto
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Programadas
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ejecutadas
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % Cumplimiento
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {datosTabla.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-xs wrap-break-word" title={item.nombre}>
                      {item.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {item.metas}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-center">
                      {item.planificadas.toFixed(0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-center">
                      {item.ejecutadas.toFixed(0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.porcentaje >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        item.porcentaje >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        item.porcentaje >= 50 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {formatPercent(item.porcentaje)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.porcentaje >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        item.porcentaje >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {item.porcentaje >= 90 ? 'Cumplida' : item.porcentaje >= 50 ? 'En Proceso' : 'Pendiente'}
                      </span>
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
                    {totalMetas}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                    {totalPlanificadas.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                    {totalEjecutadas.toFixed(0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                    {formatPercent(porcentajeTotal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default EjecucionFisica;

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { obtenerMetasProducto } from '../../lib/api';
import type { MetaProducto } from '../../types/metaProducto';
import { formatPercent, parseNumber, calculatePercentage } from '../../lib/formatters';

const MetasProductoPage = () => {
  const [metas, setMetas] = useState<MetaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [añoSeleccionado, setAñoSeleccionado] = useState<'2024' | '2025'>('2025');
  const [ejeSeleccionado, setEjeSeleccionado] = useState<string>('todos');
  const [programaSeleccionado, setProgramaSeleccionado] = useState<string>('todos');
  const [secretariaSeleccionada, setSecretariaSeleccionada] = useState<string>('todos');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('todos');
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<string>('todos');
  const [codigoMetaSeleccionado, setCodigoMetaSeleccionado] = useState<string>('');
  const [bpinSeleccionado, setBpinSeleccionado] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');

  const cargarMetas = async () => {
    try {
      setLoading(true);
      const data = await obtenerMetasProducto();
      console.log('✅ Metas de producto cargadas:', data.length);
      setMetas(data || []);
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
  const metasFiltradas = useMemo(() => {
    let filtradas = metas;

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      filtradas = filtradas.filter(meta =>
        meta.meta?.toLowerCase().includes(busquedaLower) ||
        meta.programa?.toLowerCase().includes(busquedaLower) ||
        meta.responsable?.toLowerCase().includes(busquedaLower) ||
        meta.indicador?.toLowerCase().includes(busquedaLower)
      );
    }

    if (ejeSeleccionado !== 'todos') {
      filtradas = filtradas.filter(m => m.ejePrograma === ejeSeleccionado);
    }

    if (programaSeleccionado !== 'todos') {
      filtradas = filtradas.filter(m => m.programa === programaSeleccionado);
    }

    if (secretariaSeleccionada !== 'todos') {
      filtradas = filtradas.filter(m => m.responsable === secretariaSeleccionada);
    }

    if (estadoSeleccionado !== 'todos') {
      filtradas = filtradas.filter(m => m.estado === estadoSeleccionado);
    }

    if (evaluacionSeleccionada !== 'todos') {
      filtradas = filtradas.filter(m => m.estadoEvaluacion === evaluacionSeleccionada);
    }

    if (codigoMetaSeleccionado) {
      filtradas = filtradas.filter(m => 
        m.codigoMeta?.toString().toLowerCase().includes(codigoMetaSeleccionado.toLowerCase())
      );
    }

    if (bpinSeleccionado) {
      filtradas = filtradas.filter(m => 
        m.bpin?.toString().toLowerCase().includes(bpinSeleccionado.toLowerCase())
      );
    }

    console.log(`📊 Metas filtradas: ${filtradas.length} de ${metas.length}`);
    return filtradas;
  }, [metas, busqueda, ejeSeleccionado, programaSeleccionado, secretariaSeleccionada, estadoSeleccionado, evaluacionSeleccionada, codigoMetaSeleccionado, bpinSeleccionado]);

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

  const secretariasDisponibles = useMemo(() => {
    const secretarias = new Set(metas.map(m => m.responsable).filter(Boolean));
    return Array.from(secretarias).sort();
  }, [metas]);

  const estadosDisponibles = useMemo(() => {
    const estados = new Set(metas.map(m => m.estado).filter(Boolean));
    return Array.from(estados).sort();
  }, [metas]);

  const evaluacionesDisponibles = useMemo(() => {
    const evaluaciones = new Set(metas.map(m => m.estadoEvaluacion).filter(Boolean));
    return Array.from(evaluaciones).sort();
  }, [metas]);

  // KPIs
  const totalMetas = metasFiltradas.length;
  
  const metasAltoAvance = metasFiltradas.filter(m => {
    const planeado = parseNumber(añoSeleccionado === '2024' ? m.totalPlaneado2024 : m.totalPlaneado2025);
    const ejecutado = parseNumber(añoSeleccionado === '2024' ? m.totalEjecutado2024 : m.totalEjecutado2025);
    const porcentaje = calculatePercentage(ejecutado, planeado);
    return porcentaje >= 90;
  }).length;
  
  const metasMedioAvance = metasFiltradas.filter(m => {
    const planeado = parseNumber(añoSeleccionado === '2024' ? m.totalPlaneado2024 : m.totalPlaneado2025);
    const ejecutado = parseNumber(añoSeleccionado === '2024' ? m.totalEjecutado2024 : m.totalEjecutado2025);
    const porcentaje = calculatePercentage(ejecutado, planeado);
    return porcentaje >= 50 && porcentaje < 90;
  }).length;
  
  const metasBajoAvance = metasFiltradas.filter(m => {
    const planeado = parseNumber(añoSeleccionado === '2024' ? m.totalPlaneado2024 : m.totalPlaneado2025);
    const ejecutado = parseNumber(añoSeleccionado === '2024' ? m.totalEjecutado2024 : m.totalEjecutado2025);
    const porcentaje = calculatePercentage(ejecutado, planeado);
    return porcentaje < 50;
  }).length;

  const getColorPorcentaje = (porcentaje: number) => {
    if (porcentaje >= 90) return 'text-green-600 dark:text-green-400';
    if (porcentaje >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getColorBarra = (porcentaje: number) => {
    if (porcentaje >= 90) return 'bg-green-500';
    if (porcentaje >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <PageMeta title="Metas de Producto | Dashboard Tenjo" description="Análisis y seguimiento de metas por producto del Plan de Desarrollo" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Metas de Producto
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {metas.length} metas del Plan de Desarrollo • {metasFiltradas.length} filtradas
            </p>
          </div>
          
          <button
            onClick={cargarMetas}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 self-start md:self-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Total Metas</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{totalMetas}</p>
            <p className="text-xs opacity-75 mt-2">metas de producto</p>
          </div>

          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Avance Alto</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{metasAltoAvance}</p>
            <p className="text-xs opacity-75 mt-2">≥ 90% cumplimiento</p>
          </div>

          <div className="bg-linear-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Avance Medio</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{metasMedioAvance}</p>
            <p className="text-xs opacity-75 mt-2">50% - 89% cumplimiento</p>
          </div>

          <div className="bg-linear-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium opacity-90">Avance Bajo</p>
              <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold">{metasBajoAvance}</p>
            <p className="text-xs opacity-75 mt-2">&lt; 50% cumplimiento</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔍 Filtros de Búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Búsqueda
              </label>
              <input
                type="text"
                placeholder="Buscar meta, programa, indicador..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 Año
              </label>
              <select
                value={añoSeleccionado}
                onChange={(e) => setAñoSeleccionado(e.target.value as '2024' | '2025')}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div>
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
                <option value="todos">Todos ({ejesDisponibles.length})</option>
                {ejesDisponibles.map(eje => (
                  <option key={eje} value={eje}>{eje.replace('Eje ', '')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📂 Programa PDT
              </label>
              <select
                value={programaSeleccionado}
                onChange={(e) => setProgramaSeleccionado(e.target.value)}
                disabled={ejeSeleccionado === 'todos'}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="todos">Todos ({programasDisponibles.length})</option>
                {programasDisponibles.map(programa => (
                  <option key={programa} value={programa}>{programa}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ⭐ Evaluación
              </label>
              <select
                value={evaluacionSeleccionada}
                onChange={(e) => setEvaluacionSeleccionada(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas</option>
                {evaluacionesDisponibles.map(evaluacion => (
                  <option key={evaluacion} value={evaluacion}>{evaluacion}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🏛️ Secretaría
              </label>
              <select
                value={secretariaSeleccionada}
                onChange={(e) => setSecretariaSeleccionada(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas las secretarías</option>
                {secretariasDisponibles.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎭 Estado
              </label>
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                {estadosDisponibles.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔢 Cod Meta
              </label>
              <input
                type="text"
                placeholder="Escribir código..."
                value={codigoMetaSeleccionado}
                onChange={(e) => setCodigoMetaSeleccionado(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🆔 BPIN
              </label>
              <input
                type="text"
                placeholder="Escribir BPIN..."
                value={bpinSeleccionado}
                onChange={(e) => setBpinSeleccionado(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            {(ejeSeleccionado !== 'todos' || programaSeleccionado !== 'todos' || secretariaSeleccionada !== 'todos' || estadoSeleccionado !== 'todos' || evaluacionSeleccionada !== 'todos' || codigoMetaSeleccionado || bpinSeleccionado || busqueda) && (
              <button
                onClick={() => {
                  setEjeSeleccionado('todos');
                  setProgramaSeleccionado('todos');
                  setSecretariaSeleccionada('todos');
                  setEstadoSeleccionado('todos');
                  setEvaluacionSeleccionada('todos');
                  setCodigoMetaSeleccionado('');
                  setBpinSeleccionado('');
                  setBusqueda('');
                }}
                className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Tarjetas de Metas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              📋 Metas de Producto ({metasFiltradas.length})
            </h2>
          </div>

          {metasFiltradas.length === 0 ? (
            <ComponentCard title="">
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay metas</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No se encontraron metas con los filtros aplicados.
                </p>
              </div>
            </ComponentCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metasFiltradas.map((meta) => {
                const planeado = parseNumber(añoSeleccionado === '2024' ? meta.totalPlaneado2024 : meta.totalPlaneado2025);
                const ejecutado = parseNumber(añoSeleccionado === '2024' ? meta.totalEjecutado2024 : meta.totalEjecutado2025);
                const porcentaje = calculatePercentage(ejecutado, planeado);

                return (
                  <div
                    key={meta.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Header de la tarjeta */}
                    <div className={`p-4 ${porcentaje >= 90 ? 'bg-green-50 dark:bg-green-900/20' : porcentaje >= 50 ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex gap-2 mb-1">
                            {meta.codigoMeta && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-bold rounded">
                                Cód Meta: {meta.codigoMeta}
                              </span>
                            )}
                            {meta.bpin && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 text-[10px] font-bold rounded">
                                BPIN: {meta.bpin}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-10" title={meta.meta}>
                            {meta.meta || 'Sin descripción'}
                          </h3>
                        </div>
                        <span className={`ml-2 text-2xl font-bold ${getColorPorcentaje(porcentaje)}`}>
                          {formatPercent(porcentaje)}
                        </span>
                      </div>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-4 space-y-3">
                      {/* Programa y Eje */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 dark:text-gray-400">🎯</span>
                          <span className="text-gray-600 dark:text-gray-300 line-clamp-1" title={meta.ejePrograma}>
                            {meta.ejePrograma?.replace('Eje ', '')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 dark:text-gray-400">📂</span>
                          <span className="text-gray-600 dark:text-gray-300 line-clamp-1" title={meta.programa}>
                            {meta.programa}
                          </span>
                        </div>
                      </div>

                      {/* Indicador */}
                      {meta.indicador && (
                        <div className="flex items-start gap-2 text-xs">
                          <span className="text-gray-500 dark:text-gray-400 mt-0.5">📊</span>
                          <span className="text-gray-600 dark:text-gray-300 line-clamp-2 flex-1" title={meta.indicador}>
                            {meta.indicador}
                          </span>
                        </div>
                      )}

                      {/* Barra de progreso */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">Programado: {planeado.toFixed(0)}</span>
                          <span className="text-gray-600 dark:text-gray-400">Ejecutado: {ejecutado.toFixed(0)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${getColorBarra(porcentaje)}`}
                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Estado y Evaluación */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {meta.estado && (
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            meta.estado === 'PROGRAMADO' || meta.estado === 'Programado'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : meta.estado === 'NO PROGRAMADO' || meta.estado === 'No Programado'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {meta.estado}
                          </span>
                        )}
                        {meta.estadoEvaluacion && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                            {meta.estadoEvaluacion}
                          </span>
                        )}
                      </div>

                      {/* Responsable */}
                      {meta.responsable && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="line-clamp-1" title={meta.responsable}>{meta.responsable}</span>
                        </div>
                      )}

                      {/* Botón Ver Detalle */}
                      <Link
                        to={`/metas-producto/${meta.id}`}
                        className="w-full mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalle
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MetasProductoPage;
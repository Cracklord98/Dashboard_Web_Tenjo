import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { obtenerMetasProducto } from '../../lib/api';
import { MetaProducto } from '../../types/metaProducto';

const MetaDetallePage = () => {
  const { id } = useParams<{ id: string }>();
  const [meta, setMeta] = useState<MetaProducto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDetalleMeta = async () => {
    try {
      setLoading(true);
      const todasMetas = await obtenerMetasProducto();
      // Convertir el ID de string a number para la comparación
      const metaEncontrada = todasMetas.find((m: MetaProducto) => m.id === Number(id));
      
      if (!metaEncontrada) {
        setError('Meta no encontrada');
        setMeta(null);
      } else {
        setMeta(metaEncontrada);
        setError(null);
      }
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


  // Helper functions
  const parseNumber = (value: string | number | null | undefined): number => {
    if (typeof value === 'number') return value;
    if (!value || value === '') return 0;
    const parsed = parseFloat(String(value).replace(/,/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Los trimestres vienen como decimales (0.15 = 15%), multiplicar por 100
  const parseTrimestreValue = (value: string | number | null | undefined): number => {
    const num = parseNumber(value);
    // Si el número es menor a 1, probablemente es un porcentaje (0.15), multiplicar por 100
    // Si es mayor a 1, ya es un valor absoluto
    return num < 1 && num > 0 ? num * 100 : num;
  };

  const calculatePercentage = (ejecutado: number, planeado: number): number => {
    if (planeado === 0) return 0;
    return (ejecutado / planeado) * 100;
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getColorPorcentaje = (porcentaje: number): string => {
    if (porcentaje >= 85) return 'text-green-600 dark:text-green-400';
    if (porcentaje >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getColorBarra = (porcentaje: number): string => {
    if (porcentaje >= 85) return 'bg-green-500';
    if (porcentaje >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!meta) return <ErrorMessage message="Meta no encontrada" />;

  return (
    <>
      <PageMeta 
        title={`Detalle - ${meta.meta}`} 
        description={`Detalle de la meta: ${meta.meta} - Plan de Desarrollo Tenjo`}
      />
      
      <div className="space-y-6">
        {/* Header con breadcrumb y título */}
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link 
                    to="/metas-producto" 
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Metas de Producto
                  </Link>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">Detalle</span>
                  </div>
                </li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detalle de Meta de Producto
            </h1>
          </div>
        </div>

        {/* ========== SECCIÓN 1: INFORMACIÓN GENERAL ========== */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Información General
          </h4>
          
          <div className="space-y-4">
            {/* Meta de Producto */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">META DE PRODUCTO</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{meta.meta}</p>
              <div className="flex gap-4 mt-1">
                {meta.codigoMeta && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">Código: {meta.codigoMeta}</p>
                )}
                {meta.bpin && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">BPIN: {meta.bpin}</p>
                )}
              </div>
            </div>

            {/* Jerarquía PDM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">🎯 EJE</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{meta.ejePrograma || 'N/A'}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📂 PROGRAMA PDT</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{meta.programa || 'N/A'}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">📋 SUBPROGRAMA</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{meta.subprograma || 'N/A'}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">🎯 META DE RESULTADO</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{meta.metaResultado || 'N/A'}</p>
              </div>
            </div>

            {/* Proyecto y Responsable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {meta.proyecto && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">🏗️ NOMBRE DEL PROYECTO</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{meta.proyecto}</p>
                </div>
              )}
              {meta.responsable && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">👤 RESPONSABLE</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{meta.responsable}</p>
                </div>
              )}
            </div>

            {/* Indicador y Medición */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">📊 INDICADOR</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{meta.indicador || 'N/A'}</p>
              
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Línea Base (L.B)</p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{meta.lineaBase || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Unidad de Medida</p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{meta.unidadMedida || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== SECCIÓN 2: EJECUCIÓN 2024 ========== */}
        <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <h4 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Ejecución Física 2024
          </h4>

          {/* Resumen 2024 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Programado</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {parseNumber(meta.totalPlaneado2024).toFixed(0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avance</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {parseNumber(meta.totalEjecutado2024).toFixed(0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">% Avance</p>
              <p className={`text-xl font-bold ${getColorPorcentaje(calculatePercentage(
                parseNumber(meta.totalEjecutado2024),
                parseNumber(meta.totalPlaneado2024)
              ))}`}>
                {formatPercent(calculatePercentage(
                  parseNumber(meta.totalEjecutado2024),
                  parseNumber(meta.totalPlaneado2024)
                ))}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</p>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                meta.estado === 'PROGRAMADO' || meta.estado === 'Programado'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
              }`}>
                {meta.estado || 'N/A'}
              </span>
            </div>
          </div>

          {/* Barra de Progreso 2024 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso 2024</span>
              <span className={`text-sm font-bold ${getColorPorcentaje(calculatePercentage(
                parseNumber(meta.totalEjecutado2024),
                parseNumber(meta.totalPlaneado2024)
              ))}`}>
                {formatPercent(calculatePercentage(
                  parseNumber(meta.totalEjecutado2024),
                  parseNumber(meta.totalPlaneado2024)
                ))}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getColorBarra(calculatePercentage(
                  parseNumber(meta.totalEjecutado2024),
                  parseNumber(meta.totalPlaneado2024)
                ))}`}
                style={{ width: `${Math.min(calculatePercentage(
                  parseNumber(meta.totalEjecutado2024),
                  parseNumber(meta.totalPlaneado2024)
                ), 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Detalle por Trimestres 2024 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mt-4">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Avance por Trimestre 2024
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* T1 2024 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">T1 2024</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Programado:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{parseTrimestreValue(meta.t1Planeado2024).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Ejecutado:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{parseTrimestreValue(meta.t1Ejecutado2024).toFixed(0)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">% Avance:</span>
                      <span className={`font-bold ${getColorPorcentaje(calculatePercentage(
                        parseTrimestreValue(meta.t1Ejecutado2024),
                        parseTrimestreValue(meta.t1Planeado2024)
                      ))}`}>
                        {formatPercent(calculatePercentage(
                          parseTrimestreValue(meta.t1Ejecutado2024),
                          parseTrimestreValue(meta.t1Planeado2024)
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* T2 2024 */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-l-4 border-green-500">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2">T2 2024</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Programado:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{parseTrimestreValue(meta.t2Planeado2024).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Ejecutado:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{parseTrimestreValue(meta.t2Ejecutado2024).toFixed(0)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">% Avance:</span>
                      <span className={`font-bold ${getColorPorcentaje(calculatePercentage(
                        parseTrimestreValue(meta.t2Ejecutado2024),
                        parseTrimestreValue(meta.t2Planeado2024)
                      ))}`}>
                        {formatPercent(calculatePercentage(
                          parseTrimestreValue(meta.t2Ejecutado2024),
                          parseTrimestreValue(meta.t2Planeado2024)
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* T3 2024 */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-l-4 border-yellow-500">
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2">T3 2024</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Programado:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{parseTrimestreValue(meta.t3Planeado2024).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Ejecutado:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{parseTrimestreValue(meta.t3Ejecutado2024).toFixed(0)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">% Avance:</span>
                      <span className={`font-bold ${getColorPorcentaje(calculatePercentage(
                        parseTrimestreValue(meta.t3Ejecutado2024),
                        parseTrimestreValue(meta.t3Planeado2024)
                      ))}`}>
                        {formatPercent(calculatePercentage(
                          parseTrimestreValue(meta.t3Ejecutado2024),
                          parseTrimestreValue(meta.t3Planeado2024)
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* T4 2024 */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border-l-4 border-red-500">
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">T4 2024</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Programado:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{parseTrimestreValue(meta.t4Planeado2024).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Ejecutado:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{parseTrimestreValue(meta.t4Ejecutado2024).toFixed(0)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">% Avance:</span>
                      <span className={`font-bold ${getColorPorcentaje(calculatePercentage(
                        parseTrimestreValue(meta.t4Ejecutado2024),
                        parseTrimestreValue(meta.t4Planeado2024)
                      ))}`}>
                        {formatPercent(calculatePercentage(
                          parseTrimestreValue(meta.t4Ejecutado2024),
                          parseTrimestreValue(meta.t4Planeado2024)
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== SECCIÓN 3: EJECUCIÓN 2025 CON TRIMESTRES ========== */}
        <div className="bg-linear-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Ejecución Física 2025
          </h4>

          {/* Resumen 2025 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Programado</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {parseNumber(meta.totalPlaneado2025).toFixed(0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ejecutado</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {parseNumber(meta.totalEjecutado2025).toFixed(0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">% Avance</p>
              <p className={`text-xl font-bold ${getColorPorcentaje(calculatePercentage(
                parseNumber(meta.totalEjecutado2025),
                parseNumber(meta.totalPlaneado2025)
              ))}`}>
                {formatPercent(calculatePercentage(
                  parseNumber(meta.totalEjecutado2025),
                  parseNumber(meta.totalPlaneado2025)
                ))}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</p>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                meta.estado === 'PROGRAMADO' || meta.estado === 'Programado'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
              }`}>
                {meta.estado || 'N/A'}
              </span>
            </div>
          </div>

          {/* Barra de Progreso 2025 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso 2025</span>
              <span className={`text-sm font-bold ${getColorPorcentaje(calculatePercentage(
                parseNumber(meta.totalEjecutado2025),
                parseNumber(meta.totalPlaneado2025)
              ))}`}>
                {formatPercent(calculatePercentage(
                  parseNumber(meta.totalEjecutado2025),
                  parseNumber(meta.totalPlaneado2025)
                ))}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getColorBarra(calculatePercentage(
                  parseNumber(meta.totalEjecutado2025),
                  parseNumber(meta.totalPlaneado2025)
                ))}`}
                style={{ width: `${Math.min(calculatePercentage(
                  parseNumber(meta.totalEjecutado2025),
                  parseNumber(meta.totalPlaneado2025)
                ), 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Detalle por Trimestres 2025 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Avance por Trimestre
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* T1 2025 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">T1 2025</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Programado:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{parseTrimestreValue(meta.t1Planeado2025).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Ejecutado:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{parseTrimestreValue(meta.t1Ejecutado2025).toFixed(0)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">% Avance:</span>
                      <span className={`font-bold ${getColorPorcentaje(calculatePercentage(
                        parseTrimestreValue(meta.t1Ejecutado2025),
                        parseTrimestreValue(meta.t1Planeado2025)
                      ))}`}>
                        {formatPercent(calculatePercentage(
                          parseTrimestreValue(meta.t1Ejecutado2025),
                          parseTrimestreValue(meta.t1Planeado2025)
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* T2 2025 */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border-l-4 border-green-500">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2">T2 2025</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Programado:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{parseTrimestreValue(meta.t2Planeado2025).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Ejecutado:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{parseTrimestreValue(meta.t2Ejecutado2025).toFixed(0)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">% Avance:</span>
                      <span className={`font-bold ${getColorPorcentaje(calculatePercentage(
                        parseTrimestreValue(meta.t2Ejecutado2025),
                        parseTrimestreValue(meta.t2Planeado2025)
                      ))}`}>
                        {formatPercent(calculatePercentage(
                          parseTrimestreValue(meta.t2Ejecutado2025),
                          parseTrimestreValue(meta.t2Planeado2025)
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* T3 2025 */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-l-4 border-yellow-500">
                <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-2">T3 2025</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Programado:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{parseTrimestreValue(meta.t3Planeado2025).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Ejecutado:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{parseTrimestreValue(meta.t3Ejecutado2025).toFixed(0)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">% Avance:</span>
                      <span className={`font-bold ${getColorPorcentaje(calculatePercentage(
                        parseTrimestreValue(meta.t3Ejecutado2025),
                        parseTrimestreValue(meta.t3Planeado2025)
                      ))}`}>
                        {formatPercent(calculatePercentage(
                          parseTrimestreValue(meta.t3Ejecutado2025),
                          parseTrimestreValue(meta.t3Planeado2025)
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* T4 2025 */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 border-l-4 border-red-500">
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">T4 2025</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Programado:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{parseTrimestreValue(meta.t4Planeado2025).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Ejecutado:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{parseTrimestreValue(meta.t4Ejecutado2025).toFixed(0)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">% Avance:</span>
                      <span className={`font-bold ${getColorPorcentaje(calculatePercentage(
                        parseTrimestreValue(meta.t4Ejecutado2025),
                        parseTrimestreValue(meta.t4Planeado2025)
                      ))}`}>
                        {formatPercent(calculatePercentage(
                          parseTrimestreValue(meta.t4Ejecutado2025),
                          parseTrimestreValue(meta.t4Planeado2025)
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== SECCIÓN 4: SOPORTES Y EVIDENCIAS ========== */}
        <div className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
          <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Soportes y Evidencias
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Soportes 2024 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">📄 Soportes 2024</p>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                  2024
                </span>
              </div>
              {meta.soportes2024 ? (
                <a
                  href={meta.soportes2024}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver Evidencias
                </a>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  Sin soportes registrados
                </div>
              )}
            </div>

            {/* Soportes 2025 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">📄 Soportes 2025</p>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                  2025
                </span>
              </div>
              {meta.soportes2025 ? (
                <a
                  href={meta.soportes2025}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver Evidencias
                </a>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  Sin soportes registrados
                </div>
              )}
            </div>
          </div>

          {/* Observaciones si existen */}
          {meta.observaciones && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">📝 Observaciones</p>
              <p className="text-sm text-gray-900 dark:text-white">{meta.observaciones}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MetaDetallePage;

import { Indicador } from '../../lib/api';
import { formatearMoneda, formatearPorcentaje, getTendenciaColor, getTendenciaIcon } from '../../lib/format';

interface KpiCardProps {
  indicador: Indicador;
}

export default function KpiCard({ indicador }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Tipo */}
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {indicador.tipo}
      </div>

      {/* Nombre */}
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        {indicador.nombre}
      </h3>

      {/* Valor principal */}
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {indicador.unidad === 'USD' || indicador.unidad === 'EUR'
            ? formatearMoneda(indicador.valor, indicador.unidad)
            : `${indicador.valor} ${indicador.unidad}`}
        </span>
      </div>

      {/* Tendencia y cambio */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${getTendenciaColor(indicador.tendencia)}`}>
          {getTendenciaIcon(indicador.tendencia)} {formatearPorcentaje(indicador.cambio)}
        </span>
        <span className="text-xs text-gray-500">vs. período anterior</span>
      </div>

      {/* Fecha (opcional) */}
      {indicador.fecha && (
        <div className="mt-3 text-xs text-gray-400">
          Actualizado: {new Date(indicador.fecha).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

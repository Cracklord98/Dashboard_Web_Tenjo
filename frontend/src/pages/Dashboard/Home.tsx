import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { obtenerMetasProducto } from "../../lib/api";
import { MetaProducto } from "../../types/metaProducto";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import ComponentCard from "../../components/common/ComponentCard";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Home() {
  const [metas, setMetas] = useState<MetaProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const data = await obtenerMetasProducto();
        setMetas(data || []);
      } catch (err) {
        console.error("Error cargando datos del dashboard:", err);
        setError("No se pudieron cargar los datos del Plan de Desarrollo.");
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const kpis = useMemo(() => {
    if (!metas.length) return null;

    return {
      ejes: new Set(metas.map(m => m.ejePrograma).filter(Boolean)).size,
      programas: new Set(metas.map(m => m.programa).filter(Boolean)).size,
      subprogramas: new Set(metas.map(m => m.subprograma).filter(Boolean)).size,
      metasResultado: new Set(metas.map(m => m.metaResultado).filter(Boolean)).size,
      proyectos: new Set(metas.map(m => m.proyecto).filter(Boolean)).size,
      metasProducto: metas.length
    };
  }, [metas]);

  const chartDataEjes = useMemo(() => {
    const counts: Record<string, number> = {};
    metas.forEach(m => {
      const eje = m.ejePrograma || 'Sin Eje';
      counts[eje] = (counts[eje] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [metas]);

  const chartDataEstado = useMemo(() => {
    const counts: Record<string, number> = {};
    metas.forEach(m => {
      const estado = m.estado || 'Sin definir';
      counts[estado] = (counts[estado] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [metas]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <PageMeta
        title="Dashboard General | Tenjo"
        description="Resumen general del Plan de Desarrollo Municipal de Tenjo"
      />
      
      <div className="space-y-6">
        {/* Introducción */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Bienvenido al Dashboard de Seguimiento PDM Tenjo
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Este tablero proporciona una visión integral del avance del Plan de Desarrollo Municipal. 
            Aquí podrá monitorear la estructura programática, desde los ejes estratégicos hasta las metas de producto, 
            así como el estado de ejecución física y financiera de cada iniciativa.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard title="Ejes" value={kpis?.ejes || 0} icon="🎯" color="blue" />
          <KpiCard title="Programas" value={kpis?.programas || 0} icon="📋" color="green" />
          <KpiCard title="Subprogramas MGA" value={kpis?.subprogramas || 0} icon="📂" color="yellow" />
          <KpiCard title="Metas Resultado" value={kpis?.metasResultado || 0} icon="📈" color="purple" />
          <KpiCard title="Proyectos" value={kpis?.proyectos || 0} icon="🏗️" color="orange" />
          <KpiCard title="Metas Producto" value={kpis?.metasProducto || 0} icon="✅" color="cyan" />
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ComponentCard title="Distribución de Metas por Eje">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataEjes} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ComponentCard>

          <ComponentCard title="Estado de Avance General">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataEstado}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartDataEstado.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
}

function KpiCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${colorClasses[color]}`}>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="mt-4">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
          {value.toLocaleString()}
        </h4>
      </div>
    </div>
  );
}


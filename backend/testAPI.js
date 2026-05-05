import { MetasProductoService } from './src/services/metasProductoService.js';

async function run() {
  const service = new MetasProductoService();
  const metas = await service.getAllMetas();
  const mujerMetas = metas.filter(m => m.responsable && m.responsable.toLowerCase().includes('mujer'));
  
  if (mujerMetas.length > 0) {
    const meta = mujerMetas[0];
    console.log('META:', meta.meta?.substring(0, 30));
    console.log('totalPlaneado2026:', meta.totalPlaneado2026);
    console.log('totalEjecutado2026:', meta.totalEjecutado2026);
    console.log('porcentajeAvance2026:', meta.porcentajeAvance2026);
    console.log('estadoProgramado2026:', meta.estadoProgramado2026);
  }
}

run();

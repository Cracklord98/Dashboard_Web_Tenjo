import { MetasProductoService } from './src/services/metasProductoService.js';
import { config } from './src/config/env.js';

async function run() {
  const service = new MetasProductoService();
  const metas = await service.getAllMetas();
  
  const searchTerms = [
    'Estructurar y poner en marcha',
    'Actualizar e implementar la Po',
    'Realizar un programa de taller',
    'Ejecutar un sistema de educaci'
  ];
  
  searchTerms.forEach(term => {
    const meta = metas.find(m => m.meta && m.meta.includes(term));
    if (meta) {
      console.log(`\n--- Meta: ${term} ---`);
      console.log('totalPlaneado2026:', meta.totalPlaneado2026);
      console.log('totalEjecutado2026:', meta.totalEjecutado2026);
      console.log('porcentajeAvance2026:', meta.porcentajeAvance2026);
    }
  });
}

run().catch(console.error);

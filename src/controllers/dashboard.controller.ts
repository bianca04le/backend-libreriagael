import { Request, Response } from 'express';
import { pool } from '../config/database';

export const dashboardResumen = async (_req: Request, res: Response) => {
  try {
    // 1. KPI: Ventas del día
    const ventas = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS total FROM ventas WHERE DATE(fecha) = CURRENT_DATE
    `);

    // 2. KPI: Compras del día
    const compras = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS total FROM compras WHERE DATE(fecha) = CURRENT_DATE
    `);

    // 3. KPI: Total Proveedores registrados
    const proveedores = await pool.query(`
      SELECT COUNT(*) AS total FROM proveedores
    `);

    // 4. KPI: Sumatoria total de unidades físicas en almacén
    const stockTotal = await pool.query(`
      SELECT COALESCE(SUM(stock), 0) AS total FROM productos
    `);

    // 5. TABLA: Inventario Crítico real (Detalle de productos con stock <= 10)
    const inventarioCritico = await pool.query(`
      SELECT nombre, stock FROM productos WHERE stock <= 10 ORDER BY stock ASC LIMIT 5
    `);

    // 6. TABLA: Últimas 5 transacciones unificadas en vivo (Ventas y Compras)
    const transacciones = await pool.query(`
      (SELECT 'VENTA' as tipo, id::text as codigo, total, 'ACTIVA' as estado, fecha FROM ventas)
      UNION ALL
      (SELECT 'COMPRA' as tipo, id::text as codigo, total, 'ACTIVA' as estado, fecha FROM compras)
      ORDER BY fecha DESC LIMIT 5
    `);

    res.json({
      ventas_hoy: Number(ventas.rows[0].total),
      compras_hoy: Number(compras.rows[0].total),
      total_proveedores: Number(proveedores.rows[0].total),
      total_stock: Number(stockTotal.rows[0].total),
      inventario_critico: inventarioCritico.rows,
      ultimas_transacciones: transacciones.rows
    });

  } catch (error: any) {
    console.error('Error en Dashboard:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', detalle: error.message });
  }
};
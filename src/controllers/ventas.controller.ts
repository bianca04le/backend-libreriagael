import { Request, Response } from 'express';
import { pool } from '../config/database';

// 1. REGISTRAR UNA NUEVA VENTA EN TRANSACCIÓN
export const crearVenta = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();

  try {
    const { cliente_id, usuario_id, tipo_comprobante, productos } = req.body;

    if (!productos || productos.length === 0) {
      res.status(400).json({ mensaje: 'El carrito de compras está vacío.' });
      return;
    }

    await client.query('BEGIN');

    let subtotal = 0;
    
    // Validar stock y acumular el subtotal
    for (const p of productos) {
      const prodQuery = await client.query('SELECT precio_venta, stock FROM productos WHERE id = $1', [p.producto_id]);
      if (prodQuery.rows.length === 0) {
        throw new Error(`El producto con ID ${p.producto_id} no existe.`);
      }
      
      const productoBD = prodQuery.rows[0];
      if (productoBD.stock < p.cantidad) {
        throw new Error(`Stock insuficiente para el producto ID ${p.producto_id}.`);
      }

      subtotal += Number(productoBD.precio_venta) * Number(p.cantidad);
    }

    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    // Insertar la cabecera de la venta
    const ventaQuery = `
      INSERT INTO ventas (cliente_id, usuario_id, tipo_comprobante, subtotal, igv, total, fecha)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id;
    `;
    
    const nuevaVenta = await client.query(ventaQuery, [
      cliente_id || null, 
      usuario_id || 1,    
      tipo_comprobante || 'BOLETA',
      subtotal,
      igv,
      total
    ]);

    const ventaId = nuevaVenta.rows[0].id;

    // Insertar en 'detalle_ventas' usando exactamente tu columna 'precio'
    const detalleQuery = `
      INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio, subtotal)
      VALUES ($1, $2, $3, $4, $5);
    `;

    for (const p of productos) {
      const prodQuery = await client.query('SELECT precio_venta FROM productos WHERE id = $1', [p.producto_id]);
      const precioUnitario = prodQuery.rows[0].precio_venta;
      const subtotalDetalle = precioUnitario * p.cantidad;

      // Inserción limpia en el detalle
      await client.query(detalleQuery, [
        ventaId, 
        p.producto_id, 
        p.cantidad, 
        precioUnitario, 
        subtotalDetalle
      ]);

      // Decrementar stock del inventario
      await client.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [p.cantidad, p.producto_id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: 'Venta registrada con éxito.', ventaId });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error en transacción de venta:', error);
    res.status(500).json({ mensaje: error.message || 'Error interno del servidor.' });
  } finally {
    client.release();
  }
};

// 2. LISTAR HISTORIAL DE VENTAS
export const listarVentas = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT 
        v.id, 
        v.fecha, 
        v.tipo_comprobante, 
        v.subtotal, 
        v.igv, 
        v.total,
        c.nombres AS cliente
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      ORDER BY v.id DESC;
    `;
    const resultado = await pool.query(query);
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el historial de ventas.' });
  }
};

// 3. OBTENER DETALLE DE UNA VENTA ESPECÍFICA (Ajustado con tu columna 'precio')
export const obtenerDetalleVenta = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        dv.id,
        dv.cantidad,
        dv.precio,
        dv.subtotal,
        p.nombre AS producto
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = $1;
    `;
    const resultado = await pool.query(query, [id]);
    res.status(200).json(resultado.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener el detalle de la venta.' });
  }
};
import { Request, Response } from 'express';
import { pool } from '../config/database';

// LISTAR COMPRAS
export const listarCompras = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await pool.query('SELECT * FROM compras ORDER BY id DESC');
    res.status(200).json(data.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al listar compras', error });
  }
};

// CREAR COMPRA (CON TRANSACCIÓN SQL)
export const crearCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { proveedor_id, subtotal, igv, total, productos } = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const compra = await client.query(
        `INSERT INTO compras (proveedor_id, subtotal, igv, total)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [proveedor_id, subtotal, igv, total]
      );

      const compra_id = compra.rows[0].id;

      for (const p of productos) {
        await client.query(
          `INSERT INTO detalle_compras (compra_id, producto_id, cantidad, precio_compra, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            compra_id,
            p.producto_id,
            p.cantidad,
            p.precio_compra,
            p.cantidad * p.precio_compra
          ]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ mensaje: 'Compra creada correctamente', id: compra_id });

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al procesar la transacción de compra', error });
  }
};

// OBTENER POR ID (CON DETALLES)
export const obtenerCompraPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const compra = await pool.query('SELECT * FROM compras WHERE id = $1', [id]);
    const detalle = await pool.query('SELECT * FROM detalle_compras WHERE compra_id = $1', [id]);

    if (compra.rows.length === 0) {
      res.status(404).json({ mensaje: 'Compra no encontrada' });
      return;
    }

    res.status(200).json({
      compra: compra.rows[0],
      detalle: detalle.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener la compra', error });
  }
};

// ANULAR COMPRA
export const anularCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `UPDATE compras SET estado = 'ANULADA' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({ mensaje: 'Compra no encontrada para anular' });
      return;
    }

    res.status(200).json({ mensaje: 'Compra anulada con éxito' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al anular la compra', error });
  }
};
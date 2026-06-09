import { Request, Response } from 'express';
import { pool } from '../config/database';

// 🔥 GENERADOR CÓDIGO DE BARRAS
const generarCodigoBarra = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `775${timestamp}${random}`;
};

// LISTAR PRODUCTOS
export const listarProductos = async (req: Request, res: Response): Promise<void> => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM productos ORDER BY id DESC'
    );

    res.status(200).json(resultado.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al listar productos' });
  }
};

// OBTENER POR ID
export const obtenerProducto = async (req: Request, res: Response): Promise<void> => {
  try {

    const { id } = req.params;

    const resultado = await pool.query(
      'SELECT * FROM productos WHERE id=$1',
      [id]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({ mensaje: 'Producto no encontrado' });
      return;
    }

    res.status(200).json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener producto' });
  }
};

// 🔥 POS: BUSCAR POR CÓDIGO DE BARRAS
export const buscarPorCodigo = async (req: Request, res: Response): Promise<void> => {

  try {

    const { codigo } = req.params;

    const resultado = await pool.query(
      'SELECT * FROM productos WHERE codigo_barra = $1',
      [codigo]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({ mensaje: 'Producto no encontrado' });
      return;
    }

    res.status(200).json(resultado.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al buscar producto' });
  }
};

// CREAR PRODUCTO (AUTO CODIGO BARRAS)
export const crearProducto = async (req: Request, res: Response): Promise<void> => {
  try {

    const {
      nombre,
      descripcion,
      marca,
      precio_compra,
      precio_venta,
      stock
    } = req.body;

    const codigo_barra = generarCodigoBarra();

    const resultado = await pool.query(
      `
      INSERT INTO productos(
        codigo_barra,
        nombre,
        descripcion,
        marca,
        precio_compra,
        precio_venta,
        stock
      )
      VALUES($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        codigo_barra,
        nombre,
        descripcion,
        marca,
        precio_compra,
        precio_venta,
        stock
      ]
    );

    res.status(201).json({
      mensaje: 'Producto registrado correctamente',
      producto: resultado.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
};

// ACTUALIZAR PRODUCTO
export const actualizarProducto = async (req: Request, res: Response): Promise<void> => {
  try {

    const { id } = req.params;

    const {
      nombre,
      descripcion,
      marca,
      precio_compra,
      precio_venta,
      stock
    } = req.body;

    const resultado = await pool.query(
      `
      UPDATE productos
      SET
        nombre = $1,
        descripcion = $2,
        marca = $3,
        precio_compra = $4,
        precio_venta = $5,
        stock = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        nombre,
        descripcion,
        marca,
        precio_compra,
        precio_venta,
        stock,
        id
      ]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({ mensaje: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({
      mensaje: 'Producto actualizado correctamente',
      producto: resultado.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
};

// ELIMINAR PRODUCTO
export const eliminarProducto = async (req: Request, res: Response): Promise<void> => {
  try {

    const { id } = req.params;

    const resultado = await pool.query(
      'DELETE FROM productos WHERE id=$1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {
      res.status(404).json({ mensaje: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({
      mensaje: 'Producto eliminado correctamente'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
};
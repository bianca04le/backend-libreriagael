import { Request, Response } from 'express';
import { pool } from '../config/database';

// LISTAR
export const listarProveedores = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const resultado = await pool.query(
      'SELECT * FROM proveedores ORDER BY id DESC'
    );

    res.status(200).json(resultado.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al listar proveedores'
    });

  }

};

// OBTENER
export const obtenerProveedor = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { id } = req.params;

    const resultado = await pool.query(
      'SELECT * FROM proveedores WHERE id = $1',
      [id]
    );

    if (resultado.rows.length === 0) {

      res.status(404).json({
        mensaje: 'Proveedor no encontrado'
      });

      return;
    }

    res.status(200).json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener proveedor'
    });

  }

};

// CREAR
export const crearProveedor = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const {
      ruc,
      razon_social,
      telefono,
      correo,
      direccion
    } = req.body;

    const resultado = await pool.query(
      `
      INSERT INTO proveedores(
        ruc,
        razon_social,
        telefono,
        correo,
        direccion
      )
      VALUES($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        ruc,
        razon_social,
        telefono,
        correo,
        direccion
      ]
    );

    res.status(201).json({
      mensaje: 'Proveedor registrado correctamente',
      proveedor: resultado.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al crear proveedor'
    });

  }

};

// ACTUALIZAR
export const actualizarProveedor = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { id } = req.params;

    const {
      ruc,
      razon_social,
      telefono,
      correo,
      direccion,
      estado
    } = req.body;

    const resultado = await pool.query(
      `
      UPDATE proveedores
      SET
        ruc = $1,
        razon_social = $2,
        telefono = $3,
        correo = $4,
        direccion = $5,
        estado = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        ruc,
        razon_social,
        telefono,
        correo,
        direccion,
        estado,
        id
      ]
    );

    if (resultado.rows.length === 0) {

      res.status(404).json({
        mensaje: 'Proveedor no encontrado'
      });

      return;
    }

    res.status(200).json({
      mensaje: 'Proveedor actualizado correctamente',
      proveedor: resultado.rows[0]
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al actualizar proveedor'
    });

  }

};

// ELIMINAR
export const eliminarProveedor = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { id } = req.params;

    const resultado = await pool.query(
      'DELETE FROM proveedores WHERE id=$1 RETURNING *',
      [id]
    );

    if (resultado.rows.length === 0) {

      res.status(404).json({
        mensaje: 'Proveedor no encontrado'
      });

      return;
    }

    res.status(200).json({
      mensaje: 'Proveedor eliminado correctamente'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al eliminar proveedor'
    });

  }

};
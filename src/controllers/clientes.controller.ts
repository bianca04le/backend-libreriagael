import { Request, Response } from 'express';
import { pool } from '../config/database';

// LISTAR
export const listarClientes = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const resultado = await pool.query(
      'SELECT * FROM clientes ORDER BY id DESC'
    );

    res.status(200).json(resultado.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al listar clientes'
    });

  }

};

// OBTENER
export const obtenerCliente = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { id } = req.params;

    const resultado = await pool.query(
      'SELECT * FROM clientes WHERE id=$1',
      [id]
    );

    if (resultado.rows.length === 0) {

      res.status(404).json({
        mensaje: 'Cliente no encontrado'
      });

      return;
    }

    res.status(200).json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al obtener cliente'
    });

  }

};

// CREAR
export const crearCliente = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const {
      documento,
      nombres,
      telefono,
      correo,
      direccion
    } = req.body;

    const resultado = await pool.query(
      `
      INSERT INTO clientes(
        documento,
        nombres,
        telefono,
        correo,
        direccion
      )
      VALUES($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        documento,
        nombres,
        telefono,
        correo,
        direccion
      ]
    );

    res.status(201).json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al crear cliente'
    });

  }

};

// ACTUALIZAR
export const actualizarCliente = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { id } = req.params;

    const {
      documento,
      nombres,
      telefono,
      correo,
      direccion
    } = req.body;

    const resultado = await pool.query(
      `
      UPDATE clientes
      SET
      documento=$1,
      nombres=$2,
      telefono=$3,
      correo=$4,
      direccion=$5
      WHERE id=$6
      RETURNING *
      `,
      [
        documento,
        nombres,
        telefono,
        correo,
        direccion,
        id
      ]
    );

    res.status(200).json(resultado.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al actualizar cliente'
    });

  }

};

// ELIMINAR
export const eliminarCliente = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { id } = req.params;

    await pool.query(
      'DELETE FROM clientes WHERE id=$1',
      [id]
    );

    res.status(200).json({
      mensaje: 'Cliente eliminado'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error al eliminar cliente'
    });

  }

};
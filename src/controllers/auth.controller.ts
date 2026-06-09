import { Request, Response } from 'express';
import { pool } from '../config/database';
import jwt from 'jsonwebtoken';

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const { usuario, clave } = req.body;

    const resultado = await pool.query(
      `
      SELECT *
      FROM usuarios
      WHERE usuario = $1
      `,
      [usuario]
    );

    if (resultado.rows.length === 0) {

      res.status(401).json({
        mensaje: 'Usuario no existe'
      });

      return;
    }

    const user = resultado.rows[0];

    if (user.clave !== clave) {

      res.status(401).json({
        mensaje: 'Contraseña incorrecta'
      });

      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        rol: user.rol_id
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: '8h'
      }
    );

    res.json({
      token,
      usuario: user.usuario,
      nombres: user.nombres
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      mensaje: 'Error en login'
    });
  }
};
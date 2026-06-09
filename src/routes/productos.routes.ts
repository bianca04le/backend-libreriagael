import { Router } from 'express';

import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  buscarPorCodigo
} from '../controllers/productos.controller';

const router = Router();

router.get('/', listarProductos);

router.get('/codigo/:codigo', buscarPorCodigo); // 🔥 POS

router.get('/:id', obtenerProducto);

router.post('/', crearProducto);

router.put('/:id', actualizarProducto);

router.delete('/:id', eliminarProducto);

export default router;
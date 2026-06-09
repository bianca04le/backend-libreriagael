import { Router } from 'express';
import { crearVenta, listarVentas, obtenerDetalleVenta } from '../controllers/ventas.controller';

const router = Router();

router.get('/', listarVentas);
router.get('/:id', obtenerDetalleVenta);
router.post('/', crearVenta);

export default router;
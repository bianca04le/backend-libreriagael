import { Router } from 'express';
import { 
  listarCompras, 
  crearCompra, 
  obtenerCompraPorId, 
  anularCompra 
} from '../controllers/compras.controller'; // Asegúrate de que esta ruta apunte a tu controlador

const router = Router();

// Define la raíz '/' para que al unirse con el prefijo quede como: /api/compras
router.post('/', crearCompra); 
router.get('/', listarCompras);
router.get('/:id', obtenerCompraPorId);
router.put('/:id/anular', anularCompra);

export default router;
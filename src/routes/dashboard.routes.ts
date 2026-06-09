import { Router } from 'express';
import { dashboardResumen } from '../controllers/dashboard.controller';

const router = Router();

router.get('/', dashboardResumen); // Se simplifica para heredar el prefijo del enrutador global

export default router;
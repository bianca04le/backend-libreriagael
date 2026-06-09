import express from 'express';
import cors from 'cors';

import './config/database';

import productosRoutes from './routes/productos.routes';
import authRoutes from './routes/auth.routes';
import ventasRoutes from './routes/ventas.routes';
import clientesRoutes from './routes/clientes.routes';
import proveedoresRoutes from './routes/proveedores.routes';
import comprasRoutes from './routes/compras.routes';
import dashboardRoutes from './routes/dashboard.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({
    mensaje: 'API LibreriaGael funcionando'
  });
});

app.use('/api/productos', productosRoutes);

app.listen(3000, () => {
  console.log('🚀 Servidor ejecutándose en puerto 3000');
});
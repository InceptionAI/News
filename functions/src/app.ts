/**
 * InceptionAI News API Server
 *
 * A comprehensive API server for managing news articles, images, posts, and client operations.
 * Organized with modular routes for better maintainability and scalability.
 */

import express from 'express';
import bodyParser from 'body-parser';

// Import route modules
import articlesRoutes from './routes/articles';
import imagesRoutes from './routes/images';
import publishingRoutes from './routes/publishing';
import postsRoutes from './routes/posts';
import adminRoutes from './routes/admin';

const app = express();

// Middleware
app.use(bodyParser.json());

// Health check endpoint
app.get('/ping', async (req: express.Request, res: express.Response) => {
  res.status(200).send('Pong');
});

// Mount route modules
app.use('/api/articles', articlesRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/publishing', publishingRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/admin', adminRoutes);

// Legacy endpoints (for backward compatibility)
// These will be deprecated in future versions
app.use('/', articlesRoutes);
app.use('/', imagesRoutes);
app.use('/', publishingRoutes);
app.use('/', postsRoutes);
app.use('/', adminRoutes);

export default app;

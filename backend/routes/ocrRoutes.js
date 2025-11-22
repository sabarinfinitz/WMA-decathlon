import express from 'express';
import { submitOcrWeight, getAllOcrWeights, deleteOcrWeight } from '../controllers/ocrController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const ocrRouter = express.Router();

ocrRouter.post('/weight', authMiddleware, submitOcrWeight);
ocrRouter.get('/weights', authMiddleware, getAllOcrWeights);
ocrRouter.delete('/weight/:id', authMiddleware, deleteOcrWeight);

export default ocrRouter;
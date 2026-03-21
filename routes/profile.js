import express from 'express';
import { perfil } from '../controllers/profileController.js';

const router = express.Router();

router.get('/perfil/:id', perfil);

export default router;
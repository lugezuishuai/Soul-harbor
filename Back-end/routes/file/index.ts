import express from 'express';
import * as handlers from './handlers';
import path from 'path';

const { uploadChunks, verifyChunks, mergeChunks } = handlers;

export const UPLOAD_DIR = path.resolve(__dirname, '../../public/file');
export const router = express.Router();

router.post('/uploadChunks', uploadChunks);
router.get('/verifyChunks', verifyChunks);
router.get('/mergeChunks', mergeChunks);

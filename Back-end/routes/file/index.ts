import express from 'express';
import * as handlers from './handlers';
import path from 'path';

const { uploadChunks, verifyChunks, mergeChunks } = handlers;

export const UPLOAD_DIR = path.resolve(__dirname, '../../public/file');
export const router = express.Router();

router.post('/uploadChunks', uploadChunks);
router.get('/verifyChunks', verifyChunks);
router.get('/mergeChunks', mergeChunks);
router.get('/sendFile', (req, res, next) => {
  // res.download(path.resolve(__dirname, '../../data/原图.png'));
  res.setHeader('content-disposition', `attachment; filename="${encodeURIComponent('原图.png')}"`);
  res.sendFile(path.resolve(__dirname, '../../data/原图.png'));
});

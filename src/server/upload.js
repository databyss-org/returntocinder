import multer from 'multer';
import express from 'express';

const { UPLOADS_PATH } = process.env;

const router = express.Router();
const upload = multer({
  dest: UPLOADS_PATH,
});

router.post('/supplement', upload.single('file'), (req, res) => {
  console.log('FILE', req.file);
  res.status(200).json({ filename: req.file.filename }).end();
});

export default router;

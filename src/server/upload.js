import fs from 'fs';
import multer from 'multer';
import express from 'express';

export default (requireAdminToken) => {
  const router = express.Router();
  const uploadPath = process.env.UPLOADS_PATH || './uploads';

  fs.mkdirSync(uploadPath, { recursive: true });

  const upload = multer({
    dest: uploadPath,
  });

  router.post('/supplement', requireAdminToken, upload.single('file'), (req, res) => {
    console.log('FILE', req.file);
    res.status(200).json({ filename: req.file.filename }).end();
  });

  return router;
};

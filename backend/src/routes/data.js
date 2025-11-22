const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadData,
  getDatasets,
  getDataset,
  deleteDataset
} = require('../controllers/dataController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Create uploads directory
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024
  }
});

router.use(protect);

router
  .route('/')
  .get(getDatasets)
  .post(upload.single('file'), uploadData);

router
  .route('/:id')
  .get(getDataset)
  .delete(deleteDataset);

module.exports = router;

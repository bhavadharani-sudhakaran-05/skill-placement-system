const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.join(os.tmpdir(), 'skillforge-private-resumes');
fs.mkdirSync(uploadDir, { recursive: true, mode: 0o700 });

const mimeByExtension = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

function isSupportedResumeFile(originalName, mimeType) {
  const extension = path.extname(originalName || '').toLowerCase();
  return Boolean(mimeByExtension[extension] && mimeByExtension[extension] === mimeType);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});

const fileFilter = (req, file, cb) => {
  if (!isSupportedResumeFile(file.originalname, file.mimetype)) {
    const error = new Error('Unsupported resume format. Upload a PDF or DOCX file with a matching file type.');
    error.status = 415;
    return cb(error);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 10, parts: 12 }
});

upload.privateUploadDirectory = uploadDir;
upload.isSupportedResumeFile = isSupportedResumeFile;
module.exports = upload;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.user?.id || req.user?._id || 'guest';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const supportedResumeTypes = new Map([
  ['.pdf', ['application/pdf', 'application/x-pdf', 'application/octet-stream']],
  ['.docx', [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/x-zip-compressed',
    'application/zip',
    'application/octet-stream'
  ]]
]);

function isSupportedResumeFile(originalName, mimeType) {
  const extension = path.extname(String(originalName || '')).toLowerCase();
  const allowedMimes = supportedResumeTypes.get(extension);
  if (!allowedMimes) return false;
  return allowedMimes.includes(String(mimeType || '').toLowerCase());
}

// Require the extension and MIME type to agree; Multer's generated filename
// keeps the upload outside any path supplied in originalName.
const fileFilter = (req, file, cb) => {
  if (isSupportedResumeFile(file.originalname, file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files with matching extensions and MIME types are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

upload.isSupportedResumeFile = isSupportedResumeFile;

module.exports = upload;

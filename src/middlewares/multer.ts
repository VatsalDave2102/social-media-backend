import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

import { AppError } from './errorHandler';

const storage = multer.diskStorage({
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, file.originalname);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // Define allowed file types
  const allowedFileTypes = ['.jpg', '.jpeg', '.png'];

  // Get the file extension
  const extname = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(extname)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(
      new AppError(
        'Invalid file type. Only jpg, jpeg & png files are allowed.',
        StatusCodes.BAD_REQUEST
      )
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB file size limit
  }
});

export default upload;

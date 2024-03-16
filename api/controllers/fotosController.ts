import { Request, Response, NextFunction } from "express";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import fs from "fs";
import multer from "multer";

const IMAGES_PATH = process.env.IMAGES_PATH || "uploads";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Only accept files with image mimetypes
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export const fotoUploadOne = upload.single("image");

export const fotoTransformSave = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const uploadsDir = path.join(IMAGES_PATH);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const newFilename = `${uuidv4()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toFile(path.join(IMAGES_PATH, newFilename));

    res.status(201).json({ filename: newFilename });
  } catch (error) {
    return next(error);
  }
};

export const fotoGet = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filename = req.params.id + ".jpeg";
    const image = path.resolve(IMAGES_PATH, filename);
    if (!fs.existsSync(image)) {
      return res.status(404).json({ message: "File not found" });
    }
    res.sendFile(image);
  } catch (error) {
    return next(error);
  }
};

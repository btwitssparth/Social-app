import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "public", "temp"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
import multer from "multer";

export const upload = multer({ storage, })
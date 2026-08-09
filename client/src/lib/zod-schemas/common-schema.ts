import z from "zod";
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_FILE_UPLOAD_SIZE,
  MAX_VIDEO_UPLOAD_SIZE,
} from "../constants";

export const FileSchema = z.object({
  file: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (typeof file === "undefined") return true;

      const isCorrectType = [
        ...ACCEPTED_VIDEO_TYPES,
        ...ACCEPTED_FILE_TYPES,
      ].includes(file.type);

      if (!isCorrectType) return false;

      const isVideo = ACCEPTED_VIDEO_TYPES.includes(file.type);
      if (isVideo && file.size >= MAX_VIDEO_UPLOAD_SIZE) {
        return false;
      }

      const isFile = ACCEPTED_FILE_TYPES.includes(file.type);
      if (isFile && file.size >= MAX_FILE_UPLOAD_SIZE) {
        return false;
      }

      return true;
    }, "Error message"),
});

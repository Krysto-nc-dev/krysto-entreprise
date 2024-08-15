import { generateComponents } from '@uploadthing/react';
import { generateReactHelpers } from '@uploadthing/react/hooks';
import type { OurFileRouter } from '@/app/api/uploadthing/core'; // Assurez-vous que ce chemin est correct

export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>();

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from '@clerk/nextjs/server';

const f = createUploadthing();

const authenticateUser = async (req: Request) => {
  try {
    const user = await auth(req);
    if (!user?.userId) throw new Error('Unauthorized');
    console.log('Authenticated user ID:', user.userId);
    return { userId: user.userId };
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    throw new Error('Authentication failed');
  }
};

export const ourFileRouter = {
  subaccountLogo: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete for subaccountLogo:', { metadata, file });
    }),
  
  avatar: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete for avatar:', { metadata, file });
    }),
  
  organisationLogo: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete for organisationLogo:', { metadata, file });
    }),
  
  media: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(authenticateUser)
    .onUploadComplete(({ metadata, file }) => {
      console.log('Upload complete for media:', { metadata, file });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

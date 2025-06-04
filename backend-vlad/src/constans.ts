import { join } from "path";

// Define the upload directory relative to the backend-vlad folder
export const FILE_UPLOAD_DIR = join(process.cwd(), 'public', 'files');

// Export the function to get the absolute path for a file
export const getFilePath = (fileName: string) => join(process.cwd(), 'public', 'files', fileName);
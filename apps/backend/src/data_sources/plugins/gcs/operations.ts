import { QueryT } from './types';
import { Bucket, Storage } from '@google-cloud/storage';

/**
 * TODO: add an option to pipe the file's content to a local file
 */
export const readFile = async (
  query: Extract<QueryT['query'], { operation: 'Read file' }>,
  storage: Storage,
): Promise<Buffer> => {
  const { bucket, file } = query;
  const fileData: Buffer[] = [];
  storage
    .bucket(bucket)
    .file(file)
    .createReadStream()
    .on('error', (err) => {
      throw new Error(err.message);
    })
    .on('data', (chunck) => {
      fileData.push(chunck);
    });
  return Buffer.concat(fileData);
};

/**
 * TODO: overwrite it if exists
 */
export const uploadFile = async (
  query: Extract<QueryT['query'], { operation: 'Upload file' }>,
  storage: Storage,
): Promise<File['name']> => {
  const { bucket, filePath } = query;
  try {
    const [file] = await storage.bucket(bucket).upload(filePath);
    return file.name;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const listBuckets = async (
  storage: Storage,
): Promise<Bucket['name'][]> => {
  try {
    const [buckets, ,] = await storage.getBuckets();
    return buckets.map((bucket) => bucket.name);
  } catch (err) {
    throw new Error(err.message);
  }
};

export const bucketFiles = async (
  query: Extract<QueryT['query'], { operation: 'List files in a bucket' }>,
  storage: Storage,
): Promise<File['name'][]> => {
  try {
    const [files] = await storage.bucket(query.bucket).getFiles({
      prefix: query.prefix,
    });
    return files.map((file) => file.name);
  } catch (err) {
    throw new Error(err.message);
  }
};

export const downloadFile = async (
  query: Extract<QueryT['query'], { operation: 'Download file' }>,
  storage: Storage,
): Promise<Buffer> => {
  const { bucket, file, destination } = query;
  try {
    const [buffer] = await storage
      .bucket(bucket)
      .file(file)
      .download({ destination });
    return buffer;
  } catch (err) {
    throw new Error(err.message);
  }
};

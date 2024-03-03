import { QueryT } from './types';
import { Bucket, Storage } from '@google-cloud/storage';
import { GCS as OPERATIONS } from '../common/operations';
import { MockStorage } from 'mock-gcs';

export const deleteFile = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.DELETE_FILE }>,
  storage: Storage | MockStorage,
) => {
  const { bucket, file } = query;
  try {
    await storage.bucket(bucket).file(file).delete();
  } catch (err) {
    throw new Error(err.message);
  }
};

/**
 * TODO: overwrite it if exists
 */
export const uploadFile = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.UPLOAD_FILE }>,
  storage: Storage | MockStorage,
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
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.LIST_FILES }>,
  storage: Storage | MockStorage,
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
  query: Extract<
    QueryT['query'],
    { operation: typeof OPERATIONS.DOWNLOAD_FILE }
  >,
  storage: Storage | MockStorage,
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

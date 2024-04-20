import {
  bucketFiles,
  deleteFile,
  downloadFile,
  uploadFile,
} from './operations';
import { MockStorage } from 'mock-gcs';
import { QueryT } from './types';
import { GCS as OPERATIONS } from '../common/operations';

describe('GCS operations', () => {
  const storage = new MockStorage();
  storage.bucket('testBucket');

  it('Upload file', async () => {
    const query: Extract<
      QueryT['query'],
      { operation: typeof OPERATIONS.UPLOAD_FILE }
    > = {
      operation: 'Upload file',
      bucket: 'testBucket',
      // create test.txt file with 'testing mock-gcs' text
      filePath: 'file-absolute-path',
    };

    const ret = await uploadFile(query, storage);
    expect(ret).toBe('test.txt');
  });

  it('List files in a bucket', async () => {
    const query: Extract<
      QueryT['query'],
      { operation: typeof OPERATIONS.LIST_FILES }
    > = {
      operation: 'List files in a bucket',
      bucket: 'testBucket',
    };

    const ret = await bucketFiles(query, storage);
    expect(ret[0]).toBe('test.txt');
  });

  it('Download file', async () => {
    const query: Extract<
      QueryT['query'],
      { operation: typeof OPERATIONS.DOWNLOAD_FILE }
    > = {
      operation: 'Download file',
      bucket: 'testBucket',
      file: 'test.txt',
      // destination: 'output-file-absolute-path'
    };

    const ret = await downloadFile(query, storage);
    expect(ret.toString()).toBe('testing mock-gcs');
  });

  it('Delete file', async () => {
    const query: Extract<
      QueryT['query'],
      { operation: typeof OPERATIONS.DELETE_FILE }
    > = {
      operation: 'Delete file',
      bucket: 'testBucket',
      file: 'test.txt',
    };

    await deleteFile(query, storage);
  });

  // it('List buckets', () => {});
});
export const AZURE_BLOB_STORAGE = {
  LIST_CONTAINERS: 'List containers',
  LIST_BLOBS: 'List blobs',
  CREATE_CONTAINER: 'Create container',
  UPLOAD_BLOB: 'Upload blob',
  DELETE_CONTAINER: 'Delete container',
  DELETE_BLOB: 'Delete blob',
  READ_BLOB: 'Read blob',
} as const;

export const GCS = {
  READ_FILE: 'Read file',
  UPLOAD_FILE: 'Upload file',
  LIST_BUCKETS: 'List buckets',
  LIST_FILES: 'List files in a bucket',
  DOWNLOAD_FILE: 'Download file',
};

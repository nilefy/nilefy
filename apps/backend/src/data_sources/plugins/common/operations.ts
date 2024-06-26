export const GCS = {
  DELETE_FILE: 'Delete file',
  UPLOAD_FILE: 'Upload file',
  LIST_BUCKETS: 'List buckets',
  LIST_FILES: 'List files in a bucket',
  DOWNLOAD_FILE: 'Download file',
} as const;
export const mongodb = {
  CREATE_DOC: 'Create Document',
  FIND_DOC: 'Find Document',
  VIEW_COLLECTIONS: 'View Database Collections',
  COUNT_DOCS: 'Count Documents',
  UPDATE_DOC: 'Update Document',
  REPLACE_DOC: 'Replace Document',
  DELETE_DOC: 'Delete Document',
} as const;
export const AZURE_BLOB_STORAGE = {
  LIST_CONTAINERS: 'List containers',
  LIST_BLOBS: 'List blobs',
  CREATE_CONTAINER: 'Create container',
  UPLOAD_BLOB: 'Upload blob',
  DELETE_CONTAINER: 'Delete container',
  DELETE_BLOB: 'Delete blob',
  READ_BLOB: 'Read blob',
} as const;

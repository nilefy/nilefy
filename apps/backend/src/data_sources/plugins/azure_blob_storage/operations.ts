import { BlobServiceClient } from '@azure/storage-blob';
import { QueryT } from './types';

export const listContainers = async (client: BlobServiceClient) => {};
export const listBlobs = async (
  query: Extract<QueryT['query'], { operation: 'List blobs' }>,
  client: BlobServiceClient,
) => {};
export const createContainer = async (client: BlobServiceClient) => {};
export const uploadBlob = async (
  query: Extract<QueryT['query'], { operation: 'Upload blob' }>,
  client: BlobServiceClient,
) => {};
export const deleteContainer = async (
  query: Extract<QueryT['query'], { operation: 'Delete container' }>,
  client: BlobServiceClient,
) => {};
export const deleteBlob = async (
  query: Extract<QueryT['query'], { operation: 'Delete blob' }>,
  client: BlobServiceClient,
) => {};
export const readBlob = async (
  query: Extract<QueryT['query'], { operation: 'Read blob' }>,
  client: BlobServiceClient,
) => {};

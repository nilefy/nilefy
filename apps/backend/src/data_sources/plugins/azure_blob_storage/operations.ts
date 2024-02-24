import {
  BlobDeleteResponse,
  BlobItem,
  BlobServiceClient,
  ContainerCreateResponse,
  ContainerDeleteResponse,
  ContainerItem,
} from '@azure/storage-blob';
import { QueryT } from './types';
import { AZURE_BLOB_STORAGE as OPERATIONS } from '../common/operations';

export const listContainers = async (
  query: Extract<
    QueryT['query'],
    { operation: typeof OPERATIONS.LIST_CONTAINERS }
  >,
  client: BlobServiceClient,
): Promise<ContainerItem[]> => {
  const containersIter = client.listContainers({
    includeDeleted: query.includeDeleted,
  });

  const containers: ContainerItem[] = [];
  for await (const container of containersIter) {
    containers.push(container);
  }
  return containers;
};

export const listBlobs = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.LIST_BLOBS }>,
  client: BlobServiceClient,
): Promise<{ blobs: BlobItem[]; continuationToken?: string }> => {
  const containerClient = client.getContainerClient(query.container);
  const blobsIter = containerClient
    .listBlobsFlat({
      prefix: query.prefix,
    })
    .byPage({
      maxPageSize: query.pageSize,
      continuationToken: query.continuationToken,
    });

  const blobs: BlobItem[] = [];
  let continuationToken: string | undefined;
  for await (const res of blobsIter) {
    continuationToken = res.continuationToken;
    for (const blob of res.segment.blobItems) {
      blobs.push(blob);
    }
  }
  return {
    blobs,
    continuationToken,
  };
};

export const createContainer = async (
  query: Extract<
    QueryT['query'],
    { operation: typeof OPERATIONS.CREATE_CONTAINER }
  >,
  client: BlobServiceClient,
): Promise<ContainerCreateResponse> => {
  const containerClient = client.getContainerClient(query.container);
  /**
   * TODO: use create or createIfNotExists based on our case
   */
  try {
    const container = await containerClient.create();
    return container;
  } catch (err) {
    throw new Error(err.message);
  }
};

export const uploadBlob = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.UPLOAD_BLOB }>,
  client: BlobServiceClient,
) => {
  const containerClient = client.getContainerClient(query.container);
  const blobClient = containerClient.getBlockBlobClient(query.blob);
  /**
   * TODO: determine what should be uploaded (file, data, stream, ...)
   * @link https://learn.microsoft.com/en-us/javascript/api/%40azure/storage-blob/blockblobclient?view=azure-node-latest
   */
};

export const deleteContainer = async (
  query: Extract<
    QueryT['query'],
    { operation: typeof OPERATIONS.DELETE_CONTAINER }
  >,
  client: BlobServiceClient,
): Promise<ContainerDeleteResponse> => {
  const containerClient = client.getContainerClient(query.container);
  return await containerClient.delete();
};

export const deleteBlob = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.DELETE_BLOB }>,
  client: BlobServiceClient,
): Promise<BlobDeleteResponse> => {
  const containerClient = client.getContainerClient(query.container);
  return await containerClient.deleteBlob(query.blob);
};

export const readBlob = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.READ_BLOB }>,
  client: BlobServiceClient,
) => {
  const containerClient = client.getContainerClient(query.container);
  const blobClient = containerClient.getBlobClient(query.blob);
  const downloadBlockBlobResponse = await blobClient.download();

  async function streamToBuffer(readableStream: NodeJS.ReadableStream) {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }

  try {
    const downloaded = await streamToBuffer(
      downloadBlockBlobResponse.readableStreamBody!,
    );
    return (downloaded as Buffer).toString();
  } catch (err) {
    throw new Error(err.message);
  }
};

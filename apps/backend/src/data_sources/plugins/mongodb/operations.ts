import { QueryT } from './types';
import { mongodb as OPERATIONS } from '../common/operations';
import { MongoClient, ObjectId, Document } from 'mongodb';

export const createDocument = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.CREATE_DOC }>,
  client: MongoClient,
): Promise<(ObjectId | null)[]> => {
  const { database, collection, documents } = query;
  if (documents.length > 1) {
    const docs = await client
      .db(database)
      .collection(collection)
      .insertMany(documents, {
        // prevent additional documents from being inserted if one fails
        ordered: true,
      });
    return Object.values(docs);
  }
  const doc = await client
    .db(database)
    .collection(collection)
    .insertOne(documents[0]);
  return [doc.insertedId];
};

// TODO: sort and projection options
export const findDocument = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.FIND_DOC }>,
  client: MongoClient,
): Promise<(Document | null)[]> => {
  const { database, collection, filter, multiple } = query;
  if (!multiple) {
    const doc = await client
      .db(database)
      .collection(collection)
      .findOne(filter, {
        projection: {
          _id: 0,
        },
      });
    return [doc];
  }
  const cursor = client
    .db(database)
    .collection(collection)
    .find(filter, {
      projection: {
        _id: 0,
      },
    });
  return await cursor.toArray();
};

export const viewCollections = async (
  query: Extract<
    QueryT['query'],
    { operation: typeof OPERATIONS.VIEW_COLLECTIONS }
  >,
  client: MongoClient,
): Promise<string[]> => {
  const { database } = query;
  const collections = await client.db(database).collections({
    nameOnly: true,
  });
  return collections.map((col) => col.collectionName);
};

export const countDocuments = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.COUNT_DOCS }>,
  client: MongoClient,
): Promise<number> => {
  const { database, collection, filter } = query;
  return await client
    .db(database)
    .collection(collection)
    .countDocuments(filter);
};

// TODO: add return the document option
export const updateDocument = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.UPDATE_DOC }>,
  client: MongoClient,
): Promise<ObjectId | null> => {
  const { database, collection, filter, update, multiple } = query;
  if (!multiple) {
    const doc = await client
      .db(database)
      .collection(collection)
      .updateOne(filter, update, {
        // set the upsert option to insert a document if no documents match the filter
        upsert: false,
      });
    return doc.upsertedId;
  }
  const docs = await client
    .db(database)
    .collection(collection)
    .updateMany(filter, update, {
      upsert: false,
    });
  return docs.upsertedId;
};

/**
 * TODO: add return the document option
 *
 * The value of the _id field remains the same unless you explicitly specify a new value for _id in the replacement document
 */
export const replaceDocument = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.REPLACE_DOC }>,
  client: MongoClient,
): Promise<ObjectId | null> => {
  const { database, collection, filter, replacement } = query;
  const doc = await client
    .db(database)
    .collection(collection)
    .replaceOne(filter, replacement, {
      // set the upsert option to insert a document if no documents match the filter
      upsert: false,
    });
  return doc.upsertedId;
};

// TODO: add return the document option
export const deleteDocument = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.DELETE_DOC }>,
  client: MongoClient,
): Promise<number> => {
  const { database, collection, filter, multiple } = query;
  if (!multiple) {
    const doc = await client
      .db(database)
      .collection(collection)
      .deleteOne(filter);
    return doc.deletedCount;
  }
  const docs = await client
    .db(database)
    .collection(collection)
    .deleteMany(filter);
  return docs.deletedCount;
};

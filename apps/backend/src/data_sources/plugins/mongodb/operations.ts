import { DeleteDocRetT, QueryT, UpdateDocRetT } from './types';
import { mongodb as OPERATIONS } from '../common/operations';
import { MongoClient, ObjectId, Document } from 'mongodb';

/**
 * if db name is not provided, it uses database name from connection string
 * if it is not provided in the connection string, db "test" is used by default
 */

export const createDocument = async (
  query: Extract<QueryT, { operation: typeof OPERATIONS.CREATE_DOC }>,
  client: MongoClient,
): Promise<(ObjectId | null)[]> => {
  const { database, collection, documents } = query;
  const docs = await client
    .db(database)
    .collection(collection)
    .insertMany(documents, {
      // prevent additional documents from being inserted if one fails
      ordered: true,
    });
  return Object.values(docs.insertedIds);
};

// TODO: sort and projection options
export const findDocument = async (
  query: Extract<QueryT, { operation: typeof OPERATIONS.FIND_DOC }>,
  client: MongoClient,
): Promise<(Document | null)[]> => {
  const { database, collection, filter, multiple } = query;
  if (!multiple) {
    const doc = await client
      .db(database)
      .collection(collection)
      .findOne(filter);
    return [doc];
  }
  const cursor = client.db(database).collection(collection).find(filter);
  return await cursor.toArray();
};

export const viewCollections = async (
  query: Extract<QueryT, { operation: typeof OPERATIONS.VIEW_COLLECTIONS }>,
  client: MongoClient,
): Promise<string[]> => {
  const { database } = query;
  const collections = await client.db(database).collections({
    nameOnly: true,
  });
  return collections.map((col) => col.collectionName);
};

export const countDocuments = async (
  query: Extract<QueryT, { operation: typeof OPERATIONS.COUNT_DOCS }>,
  client: MongoClient,
): Promise<number> => {
  const { database, collection, filter } = query;
  return await client
    .db(database)
    .collection(collection)
    .countDocuments(filter);
};

export const updateDocument = async (
  query: Extract<QueryT, { operation: typeof OPERATIONS.UPDATE_DOC }>,
  client: MongoClient,
): Promise<UpdateDocRetT> => {
  const { database, collection, filter, update, multiple } = query;
  if (!multiple) {
    const doc = await client
      .db(database)
      .collection(collection)
      .findOneAndUpdate(filter, update, {
        upsert: false,
      });
    return {
      updatedIds: [doc ? doc._id : null],
    };
  }
  const coll = client.db(database).collection(collection);
  const cursor = coll.find(filter);
  const ids = (await cursor.toArray()).map((doc) => doc._id);
  const ret = await client
    .db(database)
    .collection(collection)
    .updateMany(filter, update, {
      upsert: false,
    });
  if (ret.upsertedId) {
    ids.push(ret.upsertedId);
  }
  return {
    updatedIds: ids,
  };
};

// The value of the _id field remains the same unless you explicitly specify a new value for _id in the replacement document
export const replaceDocument = async (
  query: Extract<QueryT, { operation: typeof OPERATIONS.REPLACE_DOC }>,
  client: MongoClient,
): Promise<ObjectId | null> => {
  const { database, collection, filter, replacement } = query;
  const doc = await client
    .db(database)
    .collection(collection)
    .findOneAndReplace(filter, replacement, {
      // set the upsert option to insert a document if no documents match the filter
      upsert: false,
    });
  return doc ? doc._id : null;
};

export const deleteDocument = async (
  query: Extract<QueryT, { operation: typeof OPERATIONS.DELETE_DOC }>,
  client: MongoClient,
): Promise<DeleteDocRetT> => {
  const { database, collection, filter, multiple } = query;
  if (!multiple) {
    const ret = await client
      .db(database)
      .collection(collection)
      .deleteOne(filter);
    return {
      deletedCount: ret.deletedCount,
    };
  }
  const ret = await client
    .db(database)
    .collection(collection)
    .deleteMany(filter);
  return {
    deletedCount: ret.deletedCount,
  };
};

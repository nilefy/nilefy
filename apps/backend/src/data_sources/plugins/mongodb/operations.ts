import { DeleteDocRetT, QueryT, UpdateDocRetT } from './types';
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

export const updateDocument = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.UPDATE_DOC }>,
  client: MongoClient,
): Promise<UpdateDocRetT> => {
  const { database, collection, filter, update, multiple, returnDoc } = query;
  if (!multiple) {
    if (!returnDoc) {
      const doc = await client
        .db(database)
        .collection(collection)
        .updateOne(filter, update, {
          // set the upsert option to insert a document if no documents match the filter
          upsert: false,
        });
      return {
        id: doc.upsertedId,
        documents: [],
      };
    }
    const doc = await client
      .db(database)
      .collection(collection)
      .findOneAndUpdate(filter, update, {
        upsert: false,
      });
    return {
      id: doc ? doc._id : null,
      documents: [doc],
    };
  }

  const docs = await findDocument(
    {
      operation: 'Find Document',
      database,
      collection,
      filter,
      multiple: true,
    },
    client,
  );
  const ret = await client
    .db(database)
    .collection(collection)
    .updateMany(filter, update, {
      upsert: false,
    });

  if (ret.upsertedId) {
    docs.push(
      await findDocument(
        {
          operation: 'Find Document',
          database,
          collection,
          filter: {
            _id: ret.upsertedId,
          },
        },
        client,
      ),
    );
  }
  return {
    id: ret.upsertedId,
    documents: docs,
  };
};

// The value of the _id field remains the same unless you explicitly specify a new value for _id in the replacement document
export const replaceDocument = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.REPLACE_DOC }>,
  client: MongoClient,
): Promise<UpdateDocRetT> => {
  const { database, collection, filter, replacement, returnDoc } = query;
  if (!returnDoc) {
    const doc = await client
      .db(database)
      .collection(collection)
      .replaceOne(filter, replacement, {
        // set the upsert option to insert a document if no documents match the filter
        upsert: false,
      });
    return {
      id: doc.upsertedId,
      documents: [],
    };
  }
  const doc = await client
    .db(database)
    .collection(collection)
    .findOneAndReplace(filter, replacement, {
      upsert: false,
    });
  return {
    id: doc ? doc._id : null,
    documents: [doc],
  };
};

export const deleteDocument = async (
  query: Extract<QueryT['query'], { operation: typeof OPERATIONS.DELETE_DOC }>,
  client: MongoClient,
): Promise<DeleteDocRetT> => {
  const { database, collection, filter, multiple, returnDoc } = query;
  if (!multiple) {
    if (!returnDoc) {
      const doc = await client
        .db(database)
        .collection(collection)
        .deleteOne(filter);
      return {
        deletedCount: doc.deletedCount,
        documents: [null],
      };
    }
    const doc = await client
      .db(database)
      .collection(collection)
      .findOneAndDelete(filter);
    return {
      deletedCount: +(doc !== null),
      documents: [doc],
    };
  }
  const docs = await findDocument(
    {
      operation: 'Find Document',
      database,
      collection,
      filter,
      multiple: true,
    },
    client,
  );
  const ret = await client
    .db(database)
    .collection(collection)
    .deleteMany(filter);
  return {
    deletedCount: ret.deletedCount,
    documents: docs,
  };
};

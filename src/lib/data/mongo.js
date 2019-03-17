import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

export const url = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;
let db = null;

export const objectIdsToIds = list =>
  list.map(doc => {
    if (!doc.id) {
      doc.id = doc._id;
      delete doc._id;
    }
    return doc;
  });

export const connect = () =>
  new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }
    MongoClient.connect(
      url,
      (err, client) => {
        if (err) {
          return reject(err);
        }
        db = client.db(DB_NAME);
        return resolve(db);
      }
    );
  });

export const add = (entity, doc) =>
  new Promise(async (resolve, reject) => {
    const db = await connect();
    const collection = db.collection(entity);
    collection.insert(doc, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });

export const reset = async entity =>
  new Promise(async (resolve, reject) => {
    const db = await connect();
    try {
      await removeIndexes(entity);
    } catch (err) {
      return reject(err);
    }
    db.collection(entity).remove({}, {}, err => {
      if (err) {
        return reject(err);
      }
      return resolve(true);
    });
  });

export const list = (entity, query, orderBy) =>
  new Promise(async (resolve, reject) => {
    const db = await connect();
    const collection = db.collection(entity);
    const findArgs = [query];
    if (orderBy) {
      findArgs.push({ sort: orderBy });
    }
    collection.find(...findArgs).toArray((err, docs) => {
      if (err) {
        return reject(err);
      }
      return resolve(objectIdsToIds(docs));
    });
  });

export const aggregate = (entity, group, match, orderBy, unwind) =>
  new Promise(async (resolve, reject) => {
    const db = await connect();
    const collection = db.collection(entity);
    const aggregateArgs = [];
    // unwind must be first in pipeline
    if (unwind) {
      aggregateArgs.push({ $unwind: unwind });
    }
    // match must be 2nd
    if (match) {
      aggregateArgs.push({ $match: match });
    }
    aggregateArgs.push({ $group: group });
    if (orderBy) {
      aggregateArgs.push({ $sort: orderBy });
    }
    collection.aggregate(aggregateArgs).toArray((err, docs) => {
      if (err) {
        return reject(err);
      }
      return resolve(objectIdsToIds(docs));
    });
  });

export const update = (entity, query, doc) =>
  new Promise(async (resolve, reject) => {
    const db = await connect();
    const collection = db.collection(entity);
    collection.update(query, doc, {}, (err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(true);
    });
  });

export const createIndex = (entity, field, isFulltext) =>
  new Promise(async (resolve, reject) => {
    console.log(
      `Creating ${isFulltext ? 'a fulltext' : 'an'} index on ${entity}.`
    );
    const db = await connect();
    const collection = db.collection(entity);
    collection.createIndex(
      {
        [field]: isFulltext ? 'text' : 1,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        console.log('👍');
        return resolve(true);
      }
    );
  });

export const removeIndexes = entity =>
  new Promise(async (resolve, reject) => {
    const db = await connect();
    const collection = db.collection(entity);
    collection.dropIndexes((err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(true);
    });
  });

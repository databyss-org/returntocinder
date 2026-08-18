import { ObjectId } from 'mongodb';
import { update } from '../mongo';

export default (entryId, entryDoc) => update('entries', { _id: new ObjectId(entryId) }, { $set: entryDoc });
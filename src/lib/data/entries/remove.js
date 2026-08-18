import { ObjectId } from 'mongodb';
import { remove } from '../mongo';

export default entryId => remove('entries', { _id: new ObjectId(entryId) });
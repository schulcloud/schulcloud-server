import type { ObjectId } from 'mongoose';
import Pseudonym from '../../../services/pseudonym/model';
import { deleteManyResult } from '../../helper/repo.helper';
import { validateObjectId } from '../../helper/validation.helper';

const byUserFilter = (userId: ObjectId) => ({ userId });

/**
 * Return pseudonyms for userId
 * @param userId
 */
const getPseudonymsForUser = async (userId: ObjectId) => {
	validateObjectId({ userId });
	return Pseudonym.find(byUserFilter(userId)).lean().exec();
};

/**
 * Removes all pseudonyms for userId
 * @param {String|ObjectId} userId
 */
const deletePseudonymsForUser = async (userId: ObjectId) => {
	validateObjectId({ userId });
	const deleteResult = await Pseudonym.deleteMany(byUserFilter(userId)).lean().exec();
	return deleteManyResult(deleteResult);
};

export { getPseudonymsForUser, deletePseudonymsForUser };

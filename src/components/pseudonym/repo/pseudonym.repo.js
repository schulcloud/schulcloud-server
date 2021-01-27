const crypto = require('crypto');
const Pseudonym = require('../../../services/pseudonym/model');
const { deleteManyResult } = require('../../helper/repo.helper');
const { validateObjectId } = require('../../helper/validation.helper');
const { AssertionError } = require('../../../errors/index');

const algorithm = 'aes-256-gcm';
const tagLength = 16;
const iv = 'iv'; //ToDo: check security
const secret = 'secret'; //ToDo: move to configuration

const byUserFilter = (userId) => ({ userId });

const getKey = () => {
	const salt = '42';
	return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha512');
}

/**
 * Return pseudonyms for userId
 * @param userId
 */
const getPseudonymsForUser = async (userId) => {
	validateObjectId(userId);
	return Pseudonym.find(byUserFilter(userId)).lean().exec();
};

/**
 * Removes all pseudonyms for userId
 * @param {String|ObjectId} userId
 */
const deletePseudonymsForUser = async (userId) => {
	validateObjectId(userId);
	const deleteResult = await Pseudonym.deleteMany(byUserFilter(userId)).lean().exec();
	return deleteManyResult(deleteResult);
};

const deletePseudonymById = async (id) => {
	validateObjectId(id);
	return Pseudonym.deleteMany({ _id: id }).lean().exec();
}

const createPseudonym = async (userId, toolId) => {
	if (!userId || !toolId) {
		throw new AssertionError('userId and toolId must not be null or undefined');
	}

	const key = getKey();

	const cipher = crypto.createCipheriv(algorithm, key, iv);
	const value = JSON.stringify({ userId, toolId });
	const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);

	const tag = cipher.getAuthTag();

	return Buffer.concat([tag, encrypted]).toString('hex');
};

const getPseudonymData = async (pseudonym) => {
	if (!pseudonym) {
		throw new AssertionError('pseudonym must not be null or undefined');
	}

	const stringValue = Buffer.from(String(pseudonym), 'hex');

	const tag = stringValue.slice(0, tagLength);
	const encrypted = stringValue.slice(tagLength);

	const key = getKey();

	const decipher = crypto.createDecipheriv(algorithm, key, iv);

	decipher.setAuthTag(tag);

	const jsonData = decipher.update(encrypted) + decipher.final('utf8');
	return JSON.parse(jsonData);
}

module.exports = {
	getPseudonymsForUser,
	deletePseudonymsForUser,
	deletePseudonymById,
	createPseudonym,
	getPseudonymData,
};

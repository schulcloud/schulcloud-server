const crypto = require('crypto');
const Pseudonym = require('../../../services/pseudonym/model');
const { deleteManyResult } = require('../../helper/repo.helper');
const { validateObjectId } = require('../../helper/validation.helper');
const { AssertionError } = require('../../../errors/index');

const algorithm = 'aes-256-gcm';
const ivLength = 16;
const saltLength = 64;
const tagLength = 16;
const tagPosition = saltLength + ivLength;
const encryptedPosition = tagPosition + tagLength;
const secret = 'secret'; //ToDo: move to configuration

const byUserFilter = (userId) => ({ userId });

const getKey = (salt) => {
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

const createPseudonym = async (userId, toolId) => {
	if (!userId || !toolId) {
		throw new AssertionError('userId and toolId must not be null or undefined');
	}

	const iv = crypto.randomBytes(ivLength);
	const salt = crypto.randomBytes(saltLength);

	const key = getKey(salt);

	const cipher = crypto.createCipheriv(algorithm, key, iv);
	const value = JSON.stringify({ userId, toolId });
	const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);

	const tag = cipher.getAuthTag();

	return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
};

const getPseudonymData = async (pseudonym) => {
	if (!pseudonym) {
		throw new AssertionError('pseudonym must not be null or undefined');
	}

	const stringValue = Buffer.from(String(pseudonym), 'hex');

	const salt = stringValue.slice(0, saltLength);
	const iv = stringValue.slice(saltLength, tagPosition);
	const tag = stringValue.slice(tagPosition, encryptedPosition);
	const encrypted = stringValue.slice(encryptedPosition);

	const key = getKey(salt);

	const decipher = crypto.createDecipheriv(algorithm, key, iv);

	decipher.setAuthTag(tag);

	const jsonData = decipher.update(encrypted) + decipher.final('utf8');
	return JSON.parse(jsonData);
}

module.exports = {
	getPseudonymsForUser,
	deletePseudonymsForUser,
	createPseudonym,
	getPseudonymData,
};

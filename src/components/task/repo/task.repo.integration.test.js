const chai = require('chai');
const { ObjectId } = require('mongoose').Types;

const testObjects = require('../../../../test/services/helpers/testObjects');
const { SubmissionModel, HomeworkModel } = require('./db');
const { AssertionError } = require('../../../errors');

const {
	findPrivateHomeworksByUser,
	deletePrivateHomeworksFromUser,
	findPublicHomeworkIdsByUser,
	replaceUserInPublicHomeworks,
	findGroupSubmissionIdsByUser,
	findUserSubmissionsByUser,
	removeGroupSubmissionsConnectionsForUser,
	deleteSingleSubmissionsFromUser,
	findArchivedHomeworkIdsByUser,
	removeUserInArchivedHomeworks,
} = require('./task.repo');
const { equal, toString: idToString } = require('../../../helper/compare').ObjectId;
const appPromise = require('../../../app');

const { expect } = chai;

const getExpectedUpdateMany = (modifiedDocuments) => ({ success: true, modifiedDocuments });
const getExpectedDeleteMany = (deletedDocuments) => ({ success: true, deletedDocuments });
const getExpectedAssertionError = (paramName) => ({
	assertion_errors: { param: paramName, code: 'REQUIRED_PARAMENTER_MISSING' },
});

const createHomeworks = async (testHelper) => {
	const userId = testHelper.generateObjectId();
	const otherUserId = testHelper.generateObjectId();
	const lessonId = testHelper.generateObjectId();
	const courseId = testHelper.generateObjectId();

	const promPrivate = testHelper.createTestHomework({ teacherId: userId, private: true });
	const promPrivateLesson = testHelper.createTestHomework({ teacherId: userId, private: true, lessonId });
	const promPrivateCourse = testHelper.createTestHomework({ teacherId: userId, private: true, courseId });

	const promPublic = testHelper.createTestHomework({ teacherId: userId, private: false });
	const promPublicLesson = testHelper.createTestHomework({ teacherId: userId, private: false, lessonId });
	const promPublicCourse = testHelper.createTestHomework({ teacherId: userId, private: false, courseId });

	const promOtherPrivate = testHelper.createTestHomework({ teacherId: otherUserId, private: true });
	const promOtherPrivateLesson = testHelper.createTestHomework({ teacherId: otherUserId, private: true, lessonId });
	const promOtherPrivateCourse = testHelper.createTestHomework({ teacherId: otherUserId, private: true, courseId });

	const additionalUserId = testHelper.generateObjectId();
	const promArchivedCourse = testHelper.createTestHomework({ archived: [userId, additionalUserId], courseId });
	const promArchivedLesson = testHelper.createTestHomework({ archived: [userId, additionalUserId], lessonId });
	const promOtherArchivedCourse = testHelper.createTestHomework({
		archived: [otherUserId, additionalUserId],
		courseId,
	});
	const promOtheArchivedLesson = testHelper.createTestHomework({ archived: [otherUserId, additionalUserId], lessonId });

	const [
		privateH,
		privateLessonH,
		privateCourseH,
		publicH,
		publicLessonH,
		publicCourseH,
		otherPrivateH,
		otherPrivateLessonH,
		otherPrivateCourseH,
		archivedC,
		archivedL,
		otherArchivedC,
		otherArchivedL,
	] = await Promise.all([
		promPrivate,
		promPrivateLesson,
		promPrivateCourse,
		promPublic,
		promPublicLesson,
		promPublicCourse,
		promOtherPrivate,
		promOtherPrivateLesson,
		promOtherPrivateCourse,
		promArchivedCourse,
		promArchivedLesson,
		promOtherArchivedCourse,
		promOtheArchivedLesson,
	]);

	return {
		userId,
		otherUserId,
		privateH,
		privateLessonH,
		privateCourseH,
		publicH,
		publicLessonH,
		publicCourseH,
		otherPrivateH,
		otherPrivateLessonH,
		otherPrivateCourseH,
		archivedC,
		archivedL,
		otherArchivedC,
		otherArchivedL,
	};
};

const matchId = (ressource) => ({ _id }) => equal(_id, ressource._id);

const db = {};
// TODO move to homeworks/submission repository, test it there and reuse it here only
db.findHomeworks = (userId) => HomeworkModel.find({ teacherId: userId }).lean().exec();
db.findGroupSubmissions = (userId) => SubmissionModel.find({ teamMembers: userId }).lean().exec();
db.findSubmissions = (userId) => SubmissionModel.find({ stundentId: userId }).lean().exec();
db.findArchivedHomework = (userId) => HomeworkModel.find({ archived: userId }).lean().exec();
// TODO find solution without cleanup it before
db.cleanupUnexpectedHomeworks = () =>
	HomeworkModel.deleteMany({ $or: [{ teacherId: null }, { teacherId: undefined }] })
		.lean()
		.exec();

describe('in "task.repo" the function', () => {
	let app;
	let server;
	let testHelper;

	before(async () => {
		app = await appPromise;
		testHelper = testObjects(app);
		server = await app.listen(0);
		// cleanup unexpected homework states that create from other tests and not cleanup, or added by seed
		await db.cleanupUnexpectedHomeworks();
	});

	afterEach(async () => {
		await testHelper.cleanup();
	});

	after(async () => {
		await server.close();
	});

	describe('findPrivateHomeworkIdsByUser', () => {
		it('should find private homeworks from a user in all contexts', async () => {
			const { userId, privateH, privateLessonH, privateCourseH } = await createHomeworks(testHelper);

			const result = await findPrivateHomeworksByUser(userId);

			expect(result).to.be.an('array').with.lengthOf(3);
			expect(
				result.map((hw) => idToString(hw._id)),
				'when find private not added homework'
			).to.have.members([idToString(privateH._id), idToString(privateLessonH._id), idToString(privateCourseH._id)]);
		});

		it('should handle no private homeworks exist without errors', async () => {
			const userId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ teacherId: userId });
			const result = await findPrivateHomeworksByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(0);
		});

		it('should handle no user matched without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ teacherId: otherUserId });
			const result = await findPrivateHomeworksByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(0);
		});

		it('should handle unexpected inputs', async () => {
			// must execute step by step that errors not mixed
			expect(findPrivateHomeworksByUser(null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(findPrivateHomeworksByUser(undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(findPrivateHomeworksByUser('123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(findPrivateHomeworksByUser(() => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});
	});

	describe('findPublicHomeworkIdsByUser', () => {
		it('should find public homeworks from a user in all contexts', async () => {
			const { userId, publicH, publicLessonH, publicCourseH } = await createHomeworks(testHelper);

			const result = await findPublicHomeworkIdsByUser(userId);

			expect(result).to.be.an('array').with.lengthOf(3);
			// from DB and model is public homework without lesson and course possible, it is only force by client controller
			expect(result.some(matchId(publicH)), 'find public not added homework').to.be.true;
			expect(result.some(matchId(publicLessonH)), 'find public lesson homework').to.be.true;
			expect(result.some(matchId(publicCourseH)), 'find public course homework').to.be.true;
		});

		it('should handle private homeworks exist without errors', async () => {
			const userId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ teacherId: userId, private: true });
			const result = await findPublicHomeworkIdsByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(0);
		});

		it('should handle no user matched without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ teacherId: otherUserId });
			const result = await findPublicHomeworkIdsByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(0);
		});

		it('should handle unexpected inputs', async () => {
			// must execute step by step that errors not mixed
			expect(findPublicHomeworkIdsByUser(null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(findPublicHomeworkIdsByUser(undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(findPublicHomeworkIdsByUser('123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(findPublicHomeworkIdsByUser(() => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});
	});

	describe('deletePrivateHomeworksFromUser', () => {
		it('should deleted private homeworks from a user in all contexts', async () => {
			const {
				userId,
				otherUserId,
				publicH,
				publicLessonH,
				publicCourseH,
				otherPrivateH,
				otherPrivateLessonH,
				otherPrivateCourseH,
			} = await createHomeworks(testHelper);

			const result = await deletePrivateHomeworksFromUser(userId);
			expect(result).to.eql(getExpectedDeleteMany(3));

			// all homeworks that should not deleted
			const [dbResultPublic, dbResultOtherPrivate] = await Promise.all([
				db.findHomeworks(userId),
				db.findHomeworks(otherUserId),
			]);
			// check if the private homework have really been deleted i.e.
			// only public homework still exist
			expect(dbResultPublic).to.be.an('array').with.lengthOf(3);
			expect(dbResultPublic.every((hw) => hw.private !== true)).to.be.true; // false or null is ok
			expect(dbResultPublic.some(matchId(publicH))).to.be.true;
			expect(dbResultPublic.some(matchId(publicLessonH))).to.be.true;
			expect(dbResultPublic.some(matchId(publicCourseH))).to.be.true;
			// homeworks from other users are not touched
			expect(dbResultOtherPrivate).to.be.an('array').with.lengthOf(3);
			expect(dbResultOtherPrivate.some(matchId(otherPrivateH))).to.be.true;
			expect(dbResultOtherPrivate.some(matchId(otherPrivateLessonH))).to.be.true;
			expect(dbResultOtherPrivate.some(matchId(otherPrivateCourseH))).to.be.true;
		});

		it('should handle no private homeworks exist without errors', async () => {
			const userId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ private: false, teacherId: userId });
			await testHelper.createTestHomework({ private: null, teacherId: userId });
			const result = await deletePrivateHomeworksFromUser(userId);
			expect(result).to.eql(getExpectedDeleteMany(0));
		});

		it('should handle no user matched without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ teacherId: otherUserId });
			const result = await deletePrivateHomeworksFromUser(userId);
			expect(result).to.eql(getExpectedDeleteMany(0));
		});

		it('should handle unexpected inputs', async () => {
			// must execute step by step that errors not mixed

			expect(deletePrivateHomeworksFromUser(null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(deletePrivateHomeworksFromUser(undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(deletePrivateHomeworksFromUser('123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(deletePrivateHomeworksFromUser(() => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});
	});

	describe('replaceUserInPublicHomeworks', () => {
		it('should replace user in public homeworks in all contexts', async () => {
			const replaceUserId = testHelper.generateObjectId();
			const {
				userId,
				otherUserId,
				privateH,
				privateLessonH,
				privateCourseH,
				publicH,
				publicLessonH,
				publicCourseH,
				otherPrivateH,
				otherPrivateLessonH,
				otherPrivateCourseH,
			} = await createHomeworks(testHelper);

			const result = await replaceUserInPublicHomeworks(userId, replaceUserId);
			expect(result).to.eql(getExpectedUpdateMany(3));

			const [dbResultUser, dbResultOther, dbResultReplaceUser] = await Promise.all([
				db.findHomeworks(userId),
				db.findHomeworks(otherUserId),
				db.findHomeworks(replaceUserId),
			]);
			// private homework still exist
			expect(dbResultUser).to.be.an('array').with.lengthOf(3);
			expect(dbResultUser.some(matchId(privateH))).to.be.true;
			expect(dbResultUser.some(matchId(privateLessonH))).to.be.true;
			expect(dbResultUser.some(matchId(privateCourseH))).to.be.true;
			// public user is replaced
			expect(dbResultReplaceUser).to.be.an('array').with.lengthOf(3);
			expect(dbResultReplaceUser.some(matchId(publicH))).to.be.true;
			expect(dbResultReplaceUser.some(matchId(publicLessonH))).to.be.true;
			expect(dbResultReplaceUser.some(matchId(publicCourseH))).to.be.true;
			// homeworks from other users are not touched
			expect(dbResultOther).to.be.an('array').with.lengthOf(3);
			expect(dbResultOther.some(matchId(otherPrivateH))).to.be.true;
			expect(dbResultOther.some(matchId(otherPrivateLessonH))).to.be.true;
			expect(dbResultOther.some(matchId(otherPrivateCourseH))).to.be.true;
		});

		it('should handle no public homeworks exist without errors', async () => {
			const replaceUserId = testHelper.generateObjectId();
			const userId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ teacherId: userId, private: true });
			const result = await replaceUserInPublicHomeworks(userId, replaceUserId);
			expect(result).to.eql(getExpectedUpdateMany(0));
		});

		it('should handle no user matched without errors', async () => {
			const replaceUserId = testHelper.generateObjectId();
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ teacherId: otherUserId });
			const result = await replaceUserInPublicHomeworks(userId, replaceUserId);
			expect(result).to.eql(getExpectedUpdateMany(0));
		});

		it('should handle unexpected first parameter inputs', async () => {
			const replaceUserId = testHelper.generateObjectId();
			const userId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ teacherId: userId });

			expect(replaceUserInPublicHomeworks(null, replaceUserId))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(replaceUserInPublicHomeworks(undefined, replaceUserId))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(replaceUserInPublicHomeworks('123', replaceUserId))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(replaceUserInPublicHomeworks(() => {}, replaceUserId))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});

		it('should handle unexpected second parameter inputs', async () => {
			const userId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ teacherId: userId });
			// must execute step by step that errors not mixed

			expect(replaceUserInPublicHomeworks(userId, null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('replaceUserId'));
			expect(replaceUserInPublicHomeworks(userId, undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('replaceUserId'));
			expect(replaceUserInPublicHomeworks(userId, '123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('replaceUserId'));
			expect(replaceUserInPublicHomeworks(userId, () => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('replaceUserId'));
		});
	});

	describe('findGroupSubmissionIdsByUser', () => {
		it('should find only all group submissions', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();
			const otherUserId2 = testHelper.generateObjectId();

			const groupAloneProm = testHelper.createTestSubmission({ studentId: userId, teamMembers: [userId] });
			const groupOwnerProm = testHelper.createTestSubmission({ studentId: userId, teamMembers: [userId, otherUserId] });
			const groupAsTeamMemberProm = testHelper.createTestSubmission({
				studentId: otherUserId,
				teamMembers: [otherUserId, userId],
			});
			const otherGroupSubmissionProm = testHelper.createTestSubmission({
				studentId: otherUserId,
				teamMembers: [otherUserId2, otherUserId],
			});

			const [groupAlone, groupOwner, groupAsTeamMember] = await Promise.all([
				groupAloneProm,
				groupOwnerProm,
				groupAsTeamMemberProm,
				otherGroupSubmissionProm,
			]);
			const result = await findGroupSubmissionIdsByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(3);
			expect(result.some(matchId(groupAlone)), 'where user is alone in group').to.be.true;
			expect(result.some(matchId(groupOwner)), 'where user is teammember and owner').to.be.true;
			expect(result.some(matchId(groupAsTeamMember)), 'where user is a teammeber but no owner').to.be.true;
		});

		it('should handle no group submission exist without errors', async () => {
			const userId = testHelper.generateObjectId();

			await testHelper.createTestSubmission({ studentId: userId });
			const result = await findGroupSubmissionIdsByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(0);
		});

		it('should handle no user matched without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestSubmission({ studentId: otherUserId, teamMebers: [otherUserId] });
			const result = await findGroupSubmissionIdsByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(0);
		});

		it('should handle unexpected inputs', async () => {
			// must execute step by step that errors not mixed
			const resultNull = await findGroupSubmissionIdsByUser(new ObjectId());
			expect(resultNull, 'when input is any valid id').to.be.an('array').with.lengthOf(0);

			expect(findGroupSubmissionIdsByUser(null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));

			expect(findGroupSubmissionIdsByUser(undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));

			expect(findGroupSubmissionIdsByUser('123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));

			expect(findGroupSubmissionIdsByUser(() => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});
	});

	describe('removeGroupSubmissionsConnectionsForUser', () => {
		it('should remove all group connection in submissions', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();
			const otherUserId2 = testHelper.generateObjectId();

			const groupAloneProm = testHelper.createTestSubmission({ studentId: userId, teamMembers: [userId] });
			const groupOwnerProm = testHelper.createTestSubmission({ studentId: userId, teamMembers: [userId, otherUserId] });
			const groupAsTeamMemberProm = testHelper.createTestSubmission({
				studentId: otherUserId,
				teamMembers: [otherUserId, userId],
			});
			const otherGroupSubmissionProm = testHelper.createTestSubmission({
				studentId: otherUserId,
				teamMembers: [otherUserId2, otherUserId],
			});

			const [groupAlone, groupOwner, groupAsTeamMember] = await Promise.all([
				groupAloneProm,
				groupOwnerProm,
				groupAsTeamMemberProm,
				otherGroupSubmissionProm,
			]);
			const status = await removeGroupSubmissionsConnectionsForUser(userId);
			expect(status).to.eql(getExpectedUpdateMany(3));

			const result = await db.findGroupSubmissions(userId);
			expect(result.some(matchId(groupAlone)), 'where user is alone in group').to.be.false;
			expect(result.some(matchId(groupOwner)), 'where user is teammember and owner').to.be.false;
			expect(result.some(matchId(groupAsTeamMember)), 'where user is a teammeber but no owner').to.be.false;
		});

		it('should handle no group submission exist without errors', async () => {
			const userId = testHelper.generateObjectId();

			await testHelper.createTestSubmission({ studentId: userId });
			const result = await removeGroupSubmissionsConnectionsForUser(userId);
			expect(result).to.eql(getExpectedUpdateMany(0));
		});

		it('should handle no user matched without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestSubmission({ studentId: otherUserId, teamMebers: [otherUserId] });
			const result = await removeGroupSubmissionsConnectionsForUser(userId);
			expect(result).to.eql(getExpectedUpdateMany(0));
		});

		it('should handle unexpected inputs', async () => {
			// must execute step by step that errors not mixed

			expect(removeGroupSubmissionsConnectionsForUser(null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(removeGroupSubmissionsConnectionsForUser(undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(removeGroupSubmissionsConnectionsForUser('123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(removeGroupSubmissionsConnectionsForUser(() => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});
	});

	describe('findSingleSubmissionIdsByUser', () => {
		it('should find all submissions', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			const submission = await testHelper.createTestSubmission({ studentId: userId });
			const submission2 = await testHelper.createTestSubmission({ studentId: userId });
			// submission of other user
			await testHelper.createTestSubmission({ studentId: otherUserId });

			const result = await findUserSubmissionsByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(2);
			expect(result.map((sm) => idToString(sm._id))).to.have.members([
				idToString(submission._id),
				idToString(submission2._id),
			]);
		});

		it('should handle no submission exist without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestSubmission({ studentId: otherUserId });
			const result = await findUserSubmissionsByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(0);
		});

		it('should handle no user matched without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestSubmission({ studentId: otherUserId });
			const result = await findUserSubmissionsByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(0);
		});

		it('should handle unexpected inputs', async () => {
			// must execute step by step that errors not mixed
			const resultNull = await findUserSubmissionsByUser(new ObjectId());
			expect(resultNull, 'when input is any object id').to.be.an('array').with.lengthOf(0);

			expect(findUserSubmissionsByUser(null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));

			expect(findUserSubmissionsByUser(undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));

			expect(findUserSubmissionsByUser('123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));

			expect(findUserSubmissionsByUser(() => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});
	});

	describe('deleteSingleSubmissionsFromUser', () => {
		it('should remove all submissions', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			const submissionProm = testHelper.createTestSubmission({ studentId: userId });
			const otherSubmissionProm = testHelper.createTestSubmission({ studentId: otherUserId });

			const [submission, otherSubmission] = await Promise.all([submissionProm, otherSubmissionProm]);

			const result = await deleteSingleSubmissionsFromUser(userId);
			expect(result).to.eql(getExpectedDeleteMany(1));

			const dbResult = await db.findSubmissions(userId);
			expect(dbResult.some(matchId(submission))).to.be.false;
			expect(dbResult.some(matchId(otherSubmission))).to.be.false;
		});

		it('should handle no submission exist without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestSubmission({ studentId: otherUserId });
			const result = await deleteSingleSubmissionsFromUser(userId);
			expect(result).to.eql(getExpectedDeleteMany(0));
		});

		it('should handle no user matched without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestSubmission({ studentId: otherUserId });
			const result = await deleteSingleSubmissionsFromUser(userId);
			expect(result).to.eql(getExpectedDeleteMany(0));
		});

		it('should handle unexpected inputs', async () => {
			// must execute step by step that errors not mixed

			expect(deleteSingleSubmissionsFromUser(null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(deleteSingleSubmissionsFromUser(undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(deleteSingleSubmissionsFromUser('123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(deleteSingleSubmissionsFromUser(() => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});
	});

	describe('findArchivedHomeworkIdsByUser', () => {
		it('should find archived homeworks from a user in all contexts', async () => {
			const { userId, archivedC, archivedL } = await createHomeworks(testHelper);

			const result = await findArchivedHomeworkIdsByUser(userId);

			expect(result).to.be.an('array').with.lengthOf(2);
			expect(result.some(matchId(archivedC)), 'find archived homework for course').to.be.true;
			expect(result.some(matchId(archivedL)), 'find archived homework for lesson').to.be.true;
		});

		it('should handle no user matched without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ archived: otherUserId });
			const result = await findArchivedHomeworkIdsByUser(userId);
			expect(result).to.be.an('array').with.lengthOf(0);
		});

		it('should handle unexpected inputs', async () => {
			expect(findArchivedHomeworkIdsByUser(null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(findArchivedHomeworkIdsByUser(undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(findArchivedHomeworkIdsByUser('123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(findArchivedHomeworkIdsByUser(() => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});
	});

	describe('replaceUserInArchivedHomeworks', () => {
		it('should replace user in archived homeworks in all contexts', async () => {
			const { userId, otherUserId, otherArchivedC, otherArchivedL } = await createHomeworks(testHelper);

			const result = await removeUserInArchivedHomeworks(userId);
			expect(result).to.eql(getExpectedUpdateMany(2));

			const [dbResultUser, dbResultOther] = await Promise.all([
				db.findArchivedHomework(userId),
				db.findArchivedHomework(otherUserId),
			]);
			// there is no archived homework with the user
			expect(dbResultUser).to.be.an('array').with.lengthOf(0);

			// homeworks from other users are not touched
			expect(dbResultOther).to.be.an('array').with.lengthOf(2);
			expect(dbResultOther.some(matchId(otherArchivedC))).to.be.true;
			expect(dbResultOther.some(matchId(otherArchivedL))).to.be.true;
		});

		it('should handle no matching archived homeworks exist without errors', async () => {
			const userId = testHelper.generateObjectId();
			const otherUserId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ archived: otherUserId, private: true });
			const result = await removeUserInArchivedHomeworks(userId);
			expect(result).to.eql(getExpectedUpdateMany(0));
		});

		it('should handle unexpected first parameter inputs', async () => {
			const userId = testHelper.generateObjectId();

			await testHelper.createTestHomework({ archived: userId });
			// must execute step by step that errors not mixed
			expect(removeUserInArchivedHomeworks(null))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(removeUserInArchivedHomeworks(undefined))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(removeUserInArchivedHomeworks('123'))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
			expect(removeUserInArchivedHomeworks(() => {}))
				.to.eventually.throw(AssertionError)
				.with.property(getExpectedAssertionError('userId'));
		});
	});
});

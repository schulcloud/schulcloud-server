const chai = require('chai');
const app = require('../../../src/app');
const testObjects = require('../helpers/testObjects')(app);
const { homeworkModel } = require('../../../src/services/homework/model');

const homeworkService = app.service('homework');
const homeworkCopyService = app.service('homework/copy');
const { expect } = chai;


describe('homework service', () => {
	const homeworkIdsToDelete = [];

	after(async () => {
		await homeworkModel.deleteMany({ id: { $in: homeworkIdsToDelete } });
	});

	it('copies a homework via POST', async () => {
		const user = await testObjects.createTestUser({ roles: ['teacher'] });
		const homework = await homeworkService.create({
			schoolId: '0000d186816abba584714c5f',
			teacherId: user._id,
			name: 'Testaufgabe',
			description: '\u003cp\u003eAufgabenbeschreibung\u003c/p\u003e\r\n',
			availableDate: Date.now(),
			dueDate: '2030-11-16T12:47:00.000Z',
			private: true,
			archived: [user._id],
			lessonId: null,
			courseId: null,
			updatedAt: '2017-09-28T11:47:46.648Z',
			createdAt: '2017-09-28T11:47:46.648Z',
		});

		const copy = await homeworkCopyService.create({ _id: homework._id, userId: user._id });
		expect(copy.courseId).to.equal(null);
		expect(copy.lessonId).to.equal(null);
		expect(copy.name).to.equal('Testaufgabe');
		expect(copy.stats).to.equal(undefined);
		expect(copy.grade).to.equal(undefined);
	});

	it('generates data for a copy on GET', async () => {
		const user = await testObjects.createTestUser({ roles: ['teacher'] });
		const params = await testObjects.generateRequestParamsFromUser(user);
		const homework = await homeworkService.create({
			schoolId: '0000d186816abba584714c5f',
			teacherId: user._id,
			name: 'Testaufgabe',
			description: '\u003cp\u003eAufgabenbeschreibung\u003c/p\u003e\r\n',
			availableDate: Date.now(),
			dueDate: '2030-11-16T12:47:00.000Z',
			private: true,
			archived: [user._id],
			lessonId: null,
			courseId: null,
			updatedAt: '2017-09-28T11:47:46.648Z',
			createdAt: '2017-09-28T11:47:46.648Z',
		});

		const copy = await homeworkCopyService.get(homework._id, params);
		homeworkIdsToDelete.push(copy);
		expect(copy.courseId).to.equal(null);
		expect(copy.lessonId).to.equal(null);
		expect(copy.name).to.equal('Testaufgabe - Copy');
		expect(copy.stats).to.equal(undefined);
		expect(copy.grade).to.equal(undefined);
	});

	it('can only copy users own homework', async () => {
		const user = await testObjects.createTestUser({ roles: ['teacher'] });
		const otherUser = await testObjects.createTestUser({ roles: ['teacher'] });
		const params = await testObjects.generateRequestParamsFromUser(user);
		const homework = await homeworkService.create({
			schoolId: '0000d186816abba584714c5f',
			teacherId: otherUser._id,
			name: 'Testaufgabe',
			description: '\u003cp\u003eAufgabenbeschreibung\u003c/p\u003e\r\n',
			availableDate: Date.now(),
			dueDate: '2030-11-16T12:47:00.000Z',
			private: true,
			archived: [user._id],
			lessonId: null,
			courseId: null,
			updatedAt: '2017-09-28T11:47:46.648Z',
			createdAt: '2017-09-28T11:47:46.648Z',
		});
		try {
			const copy = await homeworkCopyService.create({ _id: homework._id, userId: user._id });
			homeworkIdsToDelete.push(copy._id);
			throw new Error('should have failed');
		} catch (err) {
			expect(err.message).to.not.eq('should have failed');
			expect(err.code).to.eq(403);
		}
		try {
			await homeworkCopyService.get(homework._id, params);
			throw new Error('should have failed');
		} catch (err) {
			expect(err.message).to.not.eq('should have failed');
			expect(err.code).to.eq(403);
		}
	});
});
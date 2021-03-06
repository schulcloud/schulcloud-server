const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const { info, error } = require('../src/logger');

const { connect, close } = require('../src/utils/database');

// use your own name for your model, otherwise other migrations may fail.
// The third parameter is the actually relevent one for what collection to write to.
const roleSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		permissions: [{ type: String }],
	},
	{
		timestamps: true,
	}
);

const Role = mongoose.model('role16042020', roleSchema, 'roles');

// How to use more than one schema per collection on mongodb
// https://stackoverflow.com/questions/14453864/use-more-than-one-schema-per-collection-on-mongodb

// TODO npm run migration-persist and remove this line
// TODO update seed data and remove this line

module.exports = {
	up: async function up() {
		await connect();
		// ////////////////////////////////////////////////////
		// Make changes to the database here.
		// Hint: Access models via this('modelName'), not an imported model to have
		// access to the correct database connection. Otherwise Mongoose calls never return.
		await Role.findOneAndUpdate(
			{
				name: 'administrator',
			},
			{
				$addToSet: {
					permissions: 'SYNC_START',
				},
			}
		).exec();
		await Role.findOneAndUpdate(
			{
				name: 'superhero',
			},
			{
				$addToSet: {
					permissions: 'SYNC_START',
				},
			}
		).exec();
		// ////////////////////////////////////////////////////
		await close();
	},

	down: async function down() {
		await connect();
		// ////////////////////////////////////////////////////
		// Implement the necessary steps to roll back the migration here.
		await Role.findOneAndUpdate(
			{
				name: 'administrator',
			},
			{
				$pull: {
					permissions: 'SYNC_START',
				},
			}
		).exec();
		await Role.findOneAndUpdate(
			{
				name: 'superhero',
			},
			{
				$pull: {
					permissions: 'SYNC_START',
				},
			}
		).exec();
		// ////////////////////////////////////////////////////
		await close();
	},
};

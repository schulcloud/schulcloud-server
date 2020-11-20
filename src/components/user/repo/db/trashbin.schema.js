const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: true,
			index: true,
		},
		user: { type: Object },
		account: { type: Object },
		classIds: [{ type: Schema.Types.ObjectId, ref: 'class' }],
	},
	{
		timestamps: true,
	}
);

const trashbinModel = mongoose.model('trashbin', schema);

module.exports = trashbinModel;

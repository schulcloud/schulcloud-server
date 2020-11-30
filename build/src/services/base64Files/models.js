const mongoose = require('mongoose');
const { Schema } = mongoose;
const base64FileSchema = new Schema({
    data: { type: String, require: true },
    schoolId: { type: Schema.Types.ObjectId, index: true },
    filetype: { type: String },
    filename: { type: String, require: true },
}, { timestamps: true });
const base64FileModel = mongoose.model('base64File', base64FileSchema);
module.exports = {
    base64FileSchema,
    base64FileModel,
};
//# sourceMappingURL=models.js.map
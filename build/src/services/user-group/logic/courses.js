/* eslint-disable-next-line arrow-body-style */
const getAllCourseUserIds = ({ userIds = [], teacherIds = [], substitutionIds = [] }) => {
    return userIds.concat(teacherIds).concat(substitutionIds);
};
module.exports = {
    getAllCourseUserIds,
};
//# sourceMappingURL=courses.js.map
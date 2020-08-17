const getBoolean = (value) => value === true || value === 'true';

/**
 * Convert pagination parameter to boolean if it exists
 * @param {context} context
 */
const preparePagination = (context) => {
	if (context.params) {
		const { query } = context.params;
		if (query && query.$paginate !== undefined) {
			context.params.query.$paginate = getBoolean(query.$paginate);
		}
	}
	return context;
};


module.exports = {
	preparePagination,
};

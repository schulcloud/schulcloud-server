const request = require('request-promise-native');
const { URL } = require('url');
const hooks = require('../hooks');

const cubeJsUrl = process.env.INSIGHTS_CUBEJS || 'http://localhost:4000/cubejs-api/';


/**
 * loops through the cubejs-response and returns an object:
 * @param cubeJsData {JSON}
 * @returns data - object stripped for unnecessary data and prettified
 */
const dataMassager = (cubeJsData) => {
	const parsed = JSON.parse(cubeJsData);
	const data = {};
	for (const i in parsed.data) {
		if (Object.prototype.hasOwnProperty.call(parsed.data, i)) {
			data[Object.values(parsed.data[i])[0]] = Object.values(parsed.data[i])[1] || null;
		}
	}
	return data;
}

const generateUrl = (schoolId) => {
	const query = `v1/load?query={
        "measures": [
          "Events.AvgPageLoaded"
        ],
        "timeDimensions": [
          {
            "dimension": "Events.timeStamp",
            "granularity": "hour",
            "dateRange": "Last 7 days"
          }
        ],
        "filters": [
          {
            "dimension": "Actor.school_id",
            "operator": "contains",
            "values": ["${schoolId}"]
          }
        ],
        "dimensions": [],
        "segments": []
      }`;
	return URL.resolve(cubeJsUrl, query);
};
class AvgPageLoaded {
	async find(data) {
		const { schoolId } = data.account;

		const options = {
			url: generateUrl(schoolId),
			method: 'GET',
		};
		const cubeJsData = await request(options);
		const result = dataMassager(cubeJsData);

		return result;
	}
}

module.exports = (app) => {
	const insightRoute = '/insights/avgPageLoaded';
	app.use(insightRoute, new AvgPageLoaded());
	const insightsService = app.service('/insights/avgPageLoaded');
	insightsService.hooks(hooks);
};
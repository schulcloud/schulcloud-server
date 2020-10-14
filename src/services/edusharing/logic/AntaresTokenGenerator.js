const { Configuration } = require('@schul-cloud/commons');
const request = require('request-promise-native');
const xml2js = require('xml2js-es6-promise');
const crypto = require('crypto');
const logger = require('../../../logger');

const federalState = 'NDS';
const county = 'NLQ';
const API_URL = `${Configuration.get('ES_ANTARES_API_URL')}/${federalState}/${county}`;

// ignore cert expired
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

class AntaresTokenGenerator {
	setup(app) {
		this.app = app;
	}

	async antaresRequest(statement) {
		const options = {
			method: 'POST',
			url: API_URL,
			auth: {
				username: Configuration.get('SECRET_ES_ANTARES_PROXY_USERNAME'),
				password: Configuration.get('SECRET_ES_ANTARES_PROXY_PW')
			},
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			form: {
				xmlstatement: statement,
			},
		};
		try {
			const response = await request.post(options);
			return response;
		} catch (e) {
			throw Error(`Failed to obtain Antares url. Error: ${e}`);
		}
	}

	async getAntaresNotch(antaresReference) {
		let xmlstatement = `<notch identifier='${antaresReference}' />`;
		let response = await this.antaresRequest(xmlstatement)
		//const cookie = response.cookie;
		// <notch id='8a55db037f3356b15745a3060df5968c'>0c801dfc1f20c5c8165330eb1498f216</notch>
		const linkId = response.substring(11, 43);
		const notch = response.substring(45, 77);

		const pass =  this.createHash(notch, Configuration.get('SECRET_ES_ANTARES_NOTCH'));
		xmlstatement = `<link id='${linkId}'>${pass}</link>`;
		response = await this.antaresRequest(xmlstatement)
		logger.info(response);
		/*
		<link size='325 MByte'>
			<a href='http://xplayhtml5.datenbank-bildungsmedien.net/24648f747277fbee088e67a6004c7467/NDR-31503-cnv_mp4_a/NDR-Avanti-Avanti-17.mp4'>direct</a>
			<a href='http://xplayhtml5.datenbank-bildungsmedien.net/24648f747277fbee088e67a6004c7467/NDR-31503-download/NDR-Avanti-Avanti-17.mp4'>download</a>
		</link>
		*/
		const parsed = await xml2js(response);
		return parsed.link.a[0].$.href;
	}

	async FIND(data) {
		const { antaresReference } = data.query;
		if (!Configuration.get('FEATURE_ES_ANTARES_ENABLED')) {
			return Configuration.get('ES_ANTARES_API_URL');
		}
		return await this.getAntaresNotch(antaresReference);
	}

	createHash(notch, secret) {
		let phrase = notch + ':' + secret;
		return crypto.createHash('md5').update(phrase).digest('hex');
	}
}

module.exports = new AntaresTokenGenerator();

const { Configuration } = require('@hpi-schul-cloud/commons');

const { HOST } = require('./globals');

const secrets = {
	smtp: Configuration.get('SMTP'),
	sendmail: {
		host: Configuration.get('SMTP_HOST'),
		port: Configuration.get('SMTP_PORT'),
	},
	aws: {
		signatureVersion: 'v4',
		s3ForcePathStyle: true,
		sslEnabled: true,
		accessKeyId: Configuration.get('AWS_ACCESS_KEY'),
		secretAccessKey: Configuration.get('AWS_SECRET_ACCESS_KEY'),
		region: Configuration.get('AWS_REGION'),
		endpointUrl: Configuration.get('AWS_ENDPOINT_URL'),
		cors_rules: [
			{
				AllowedHeaders: ['*'],
				AllowedMethods: ['PUT'],
				AllowedOrigins: [HOST],
				MaxAgeSeconds: 300,
			},
		],
	},
	authentication: Configuration.get('AUTHENTICATION'),
};

module.exports = secrets;

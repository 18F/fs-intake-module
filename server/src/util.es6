'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');
const request = require('request-promise');

const Revision = require('./models/revision.es6');
const vcapConstants = require('./vcap-constants.es6');

let util = {};

util.noncommercialOrgTypes = ['Person', 'Corporation'];

util.datetimeFormat = 'YYYY-MM-DDTHH:mm:ssZ';

util.stateCodes = [
  'AK',
  'AL',
  'AR',
  'AZ',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'IA',
  'ID',
  'IL',
  'IN',
  'KS',
  'KY',
  'LA',
  'MA',
  'MD',
  'ME',
  'MI',
  'MN',
  'MO',
  'MS',
  'MT',
  'NC',
  'ND',
  'NE',
  'NH',
  'NJ',
  'NM',
  'NV',
  'NY',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VA',
  'VT',
  'WA',
  'WI',
  'WV',
  'WY'
];

util.statusOptions = ['Submitted', 'Incomplete', 'Hold', 'Review', 'Cancelled', 'Accepted', 'Rejected', 'Expired'];

util.validateDateTime = input => {
  return (
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/.test(input) &&
    moment(input, util.datetimeFormat).isValid()
  );
};

util.middleLayerAuth = () => {
  const requestOptions = {
    method: 'POST',
    url: vcapConstants.middleLayerBaseUrl + 'auth',
    json: true,
    simple: true,
    body: {
      username: vcapConstants.middleLayerUsername,
      password: vcapConstants.middleLayerPassword
    },
    transform: body => body.token
  };
  return util.request(requestOptions);
};

util.prepareCerts = () => {
  const s3 = new AWS.S3({
    accessKeyId: vcapConstants.certsAccessKeyId,
    secretAccessKey: vcapConstants.certsSecretAccessKey,
    region: vcapConstants.certsRegion
  });

  const loginGovPrivateKeyPromise = new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: vcapConstants.certsBucket,
        Key: vcapConstants.loginGovPrivateKey
      },
      (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data.Body.toString('utf8'));
      }
    );
  });

  const loginGovDecryptionCertPromise = new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: vcapConstants.certsBucket,
        Key: vcapConstants.loginGovDecryptionCert
      },
      (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data.Body.toString('utf8'));
      }
    );
  });

  return Promise.all([loginGovPrivateKeyPromise, loginGovDecryptionCertPromise]);
};

const getExtension = filename => {
  return filename.split('.').reverse()[0];
};

util.getContentType = filename => {
  if (getExtension(filename) === 'pdf') {
    return 'application/pdf';
  }
  if (getExtension(filename) === 'rtf') {
    return 'application/rtf';
  }
  if (getExtension(filename) === 'doc') {
    return 'application/msword';
  }
  if (getExtension(filename) === 'docx') {
    return 'application/msword';
  }
  if (getExtension(filename) === 'xls') {
    return 'application/vnd.ms-excel';
  }
  if (getExtension(filename) === 'xlsx') {
    return 'application/vnd.ms-excel';
  }
};

// used to bypass authentication when doing development
util.isLocalOrCI = () => {
  const environments = ['CI', 'local'];
  return environments.indexOf(process.env.PLATFORM) !== -1;
};

util.setAuthEmail = req => {
  if (util.isLocalOrCI()) {
    req.body.authEmail = 'test@test.com';
  } else {
    req.body.authEmail = req.user.email;
  }
};

util.getUser = req => {
  if (util.isLocalOrCI()) {
    return {
      email: 'test@test.com',
      role: 'admin'
    };
  } else {
    return req.user;
  }
};

util.hasPermissions = (user, applicationModel) => {
  return user.role === 'admin' || user.email === applicationModel.authEmail;
};

util.createRevision = (user, applicationModel) => {
  Revision.create({
    applicationId: applicationModel.applicationId,
    applicationType: applicationModel.type,
    status: applicationModel.status,
    email: user.email
  });
};

util.camelCaseToRegularForm = string => {
  const spaced = string.replace(/([A-Z])/g, ' $1');
  const lowerCase = spaced.toLowerCase();
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
};

util.businessNameElsePersonalName = application => {
  let businessName = application.applicantInfoOrganizationName;
  if (!businessName) {
    businessName = `${application.applicantInfoPrimaryFirstName} ${application.applicantInfoPrimaryLastName}`;
  }
  return businessName;
};

util.getRandomHexString = () => {
  return new Buffer(`${Math.random()}${Math.random()}`).toString('hex');
};

util.request = request;

module.exports = util;

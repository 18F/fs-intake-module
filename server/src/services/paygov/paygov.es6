/**
 * pay.gov utility
 * @module services/paygov
 */
const jwt = require('jsonwebtoken');
const _ = require('lodash/fp');
const xml = require('xml');

const logger = require('../../services/logger.es6');
const vcapConstants = require('../../vcap-constants.es6');
const util = require('../util.es6');
const paygovTemplates = require('./paygovTemplates.es6');

const DEFAULT_ERROR_CODE = '9999';

class PayGovError extends Error {
  constructor(code = DEFAULT_ERROR_CODE, message, detail) {
    super(message);
    this.name = 'PayGovError';
    this.code = code;
    this.detail = detail;
  }

  toString() {
    return `${this.name} ${this.code}: ${this.message}`;
  }
}

const paygov = {};

/**
 * @function createToken - create token for paygov request
 * @param {string} forestAbbr - forest abbreviation
 * @param {string} permitId - permit id
 * @return {Promise} - Promise that resolves to a jwt signed token
 */
paygov.createToken = (permitId) => {
  const claims = {
    issuer: 'trees-permit-api',
    subject: 'christmas tree permit orders',
    audience: 'fs-trees-permit-api-users'
  };

  const token = jwt.sign(
    {
      data: permitId
    },
    vcapConstants.PERMIT_SECRET,
    claims
  );
  return token;
};


/**
 * @function returnUrl - create return url for paygov request
 * @param {string} forestAbbr - forest abbreviation
 * @param {string} permitId - permit id
 * @param {Boolean} isCancelUrl - whether to include the cancel query
 * @return {Promise} - Promise that resolves to a success URL for payGov
 */
paygov.returnUrl = (forestAbbr, permitId, isCancelUrl) => {
  const token = paygov.createToken(permitId);
  let url = `${vcapConstants.INTAKE_CLIENT_BASE_URL}/firewood/forests/`;
  url += `${forestAbbr}/permits/${permitId}`;
  url += `${isCancelUrl ? 'cancel=true' : ''}t=${token}`;
  return url;
};

/**
 * @function getXmlStartCollection - Generate XML from the template to use for getting pay.gov transaction token.
 * @param {string} forestAbbr - forest abbreviation
 * @param {string} possFinancialId - forest's financial id
 * @param {Object} permit - permit object from database
 * @return {Promise} - Promise that resolves to XML for payGov startOnlineCollection request
 */
paygov.getXmlStartCollection = (forestAbbr, possFinancialId, permit) => {
  const tcsAppID = vcapConstants.PAY_GOV_APP_ID;

  const startCollectionXML = JSON.parse(JSON.stringify(paygovTemplates.startCollection));
  startCollectionXML[0]['soap:Envelope'][1]['soap:Body'][0]['ns2:startOnlineCollection'][1]
    .startOnlineCollectionRequest = [
      {
        tcs_app_id: tcsAppID
      },
      {
        agency_tracking_id: permit.permitNumber
      },
      {
        transaction_type: 'Sale'
      },
      {
        transaction_amount: permit.totalCost
      },
      {
        language: 'EN'
      },
      {
        url_success: paygov.returnUrl(forestAbbr, permit.permitId, false)
      },
      {
        url_cancel: paygov.returnUrl(forestAbbr, permit.permitId, true)
      },
      {
        account_holder_name: `${permit.firstName} ${permit.lastName}`
      },
      {
        custom_fields: [
          {
            custom_field_1: possFinancialId
          }
        ]
      }
    ];
  return xml(startCollectionXML);
};

/**
 * @function getXmlToCompleteTransaction - Generate XML from the template to use for completing pay.gov transaction.
 * @param {string} paygovToken - payGov token
 * @return {string} - XML for payGov completeOnlineCollection request
 */
paygov.getXmlToCompleteTransaction = (paygovToken) => {
  const xmlTemplate = JSON.parse(JSON.stringify(paygovTemplates.completeTransaction));
  const requestDetails = [
    {
      tcs_app_id: vcapConstants.PAY_GOV_APP_ID
    },
    {
      token: paygovToken
    }
  ];
  xmlTemplate[0]['soap:Envelope'][2]['soap:Body'][0]['ns2:completeOnlineCollection'][1]
    .completeOnlineCollectionRequest = requestDetails;
  return xml(xmlTemplate);
};

/**
 * @function extractToken - Get token out of the paygov response
 * @param {Object} result - payGov result for startOnlineCollection as JSON
 * @return {string} - paygov token
 */
paygov.extractToken = (result) => {
  try {
    return result['S:Envelope']['S:Body'][0]['ns2:startOnlineCollectionResponse'][0]
      .startOnlineCollectionResponse[0].token[0];
  } catch (error) {
    throw new PayGovError(`extractToken: ${error}`, result);
  }
};

/**
 * @function extractError - Get error out of the paygov response
 * @param {Object} result - response error object as JSON
 * @return {PayGovError}
 */
/* eslint-disable prefer-destructuring */
paygov.extractError = (result) => {
  let code = DEFAULT_ERROR_CODE;
  let message = 'extractError: no message';

  const fault = _.get('S:Envelope.S:Body[0].S:Fault[0]', result);

  if (fault) {
    code = fault.faultcode[0];
    message = fault.faultstring[0];

    const faultDetail = _.get('detail[0].ns2:TCSServiceFault[0]', fault);
    if (faultDetail) {
      code = faultDetail.return_code[0];
      message = faultDetail.return_detail[0];
    }
  }

  return new PayGovError(code, message, result);
};
/* eslint-enable prefer-destructuring */

/**
 * @function extractTrackingId - Get paygov tracking id out of the paygov response
 * @param {Object} result - result from paygov request for completeOnlineCollection as JSON
 * @return {string} - paygov tracking id
 */
paygov.extractTrackingId = (result) => {
  try {
    return result['S:Envelope']['S:Body'][0]['ns2:completeOnlineCollectionResponse'][0]
      .completeOnlineCollectionResponse[0].paygov_tracking_id[0];
  } catch (error) {
    throw new PayGovError(`extractTrackingId: ${error}`, result);
  }
};

/**
 * @function postPayGov - Function to make a post request to pay.gov/mock pay.gov
 * @param {String} xmlData - xml to be posted to payGov endpoint
 * @return {Promise} - response from payGov
 */
paygov.postPayGov = async (xmlData) => {
  const payGovPrivateKey = Buffer.from(vcapConstants.PAY_GOV_PRIVATE_KEY, 'utf8');
  const payGovCert = Buffer.from(vcapConstants.PAY_GOV_CERT[0], 'utf8');
  const request = {
    url: vcapConstants.PAY_GOV_URL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml'
    },
    body: xmlData,
    key: payGovPrivateKey,
    cert: payGovCert
  };

  try {
    return await util.request.post(request);
  } catch (error) {
    const json = await util.parseXml(error.error);
    throw paygov.extractError(json);
  }
};

paygov.handleError = (error) => {
  if (error instanceof PayGovError) {
    throw error;
  }
  throw new PayGovError(error.message);
};

paygov.log = (type, event, params) => {
  logger[type](`PAYGOV: ${event} - ${JSON.stringify(params)}`);
};

module.exports = paygov;

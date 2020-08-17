const htmlToText = require('html-to-text');
const moment = require('moment-timezone');
const uuid = require('uuid/v4');
const zpad = require('zpad');

const email = require('../email/email-util.es6');
const forestDb = require('../models/forests.es6');
const vcapConstants = require('../vcap-constants.es6');
const paygov = require('./paygov');
const permitSvgService = require('./christmas-trees-permit-svg-util.es6');

const firewoodPermitService = {};

/**
 * @function translatePermitFromClientToDatabase - Private function to translate request data to the database json object
 * @param {Object} input - christmas trees permit object from database
 * @return {Object} - formatted permit object
 */
firewoodPermitService.translatePermitFromClientToDatabase = (permit, forest) => ({
  permitId: uuid(),
  firstName: permit.firstName,
  lastName: permit.lastName,
  emailAddress: permit.emailAddress,
  quantity: permit.quantity,
  // TODO update to reflect real cost
  totalCost: parseInt(permit.quantity, 10) * 1,
  forestId: forest.id,
  orgStructureCode: forest.orgStructureCode,
  permitExpireDate: forest.endDate
});

/**
 * @function permitResult - Private function to return formatted permit result
 * @param {Object} permit - permit object from database
 * @return {Object} - formatted permit object
 */
firewoodPermitService.permitResult = permit => ({
  permitId: permit.permitId,
  orgStructureCode: permit.orgStructureCode,
  firstName: permit.firstName,
  lastName: permit.lastName,
  emailAddress: permit.emailAddress,
  quantity: permit.quantity,
  totalCost: permit.totalCost,
  status: permit.status,
  transactionDate: permit.updatedAt,
  paygovTrackingId: permit.paygovTrackingId,
  expirationDate: permit.permitExpireDate,
  permitNumber: zpad(permit.permitNumber, 8),
  forest: {
    forestName: permit.christmasTreesForest ? permit.christmasTreesForest.forestName : null,
    forestAbbr: permit.christmasTreesForest ? permit.christmasTreesForest.forestAbbr : null,
    forestNameShort: permit.christmasTreesForest ? permit.christmasTreesForest.forestNameShort : null
  }
});

firewoodPermitService.createPermitTransaction = async (application, forest) => {
  const transformed = firewoodPermitService.translatePermitFromClientToDatabase(application, forest);
  const permit = await forestDb.firewoodPermits.create(transformed);

  let paygovToken;

  try {
    paygovToken = await paygov.startCollection(forest, permit);
  } catch (paygovError) {
    await permit.update({ status: 'Error', paygovError: paygovError.toString() });
    throw new Error('Paygov Error');
  }

  const savedPermit = await permit.update({ paygovToken });

  const createPermitResponse = {
    token: paygovToken,
    permitId: savedPermit.permitId,
    payGovUrl: vcapConstants.PAY_GOV_CLIENT_URL,
    tcsAppID: vcapConstants.PAY_GOV_APP_ID
  };

  return createPermitResponse;
};

/**
 * @function generateRulesAndEmail - Private function to generate svg, png, and rules html of a permit and send out email
 * @param {Object} permit - permit object
 */
firewoodPermitService.generateRulesAndEmail = permit => permitSvgService.generatePermitSvg(permit)
  .then(permitSvg => Promise.all([
    permitSvgService.generatePng(permitSvg),
    permitSvgService.generateRulesHtml(true, permit)
  ]))
  .then(([permitPng, rulesHtml]) => {
    const permitUrl = paygov.returnUrl(
      permit.christmasTreesForest.forestAbbr,
      permit.permitId,
      false
    );
    // eslint-disable-next-line no-param-reassign
    permit.permitUrl = permitUrl;
    const rulesText = htmlToText.fromString(rulesHtml, {
      wordwrap: 130,
      ignoreImage: true
    });
    return firewoodPermitService.sendEmail(permit, permitPng, rulesHtml, rulesText);
  });

/**
 * @function completePermitTransaction - method to take an update request to complete the permit
 * and send complete transaction request to pay.gov and generate the permit email
 * @param {Object} permit - object model of an existing permit to be completed
 * @param {Object} req - http request
 * @param {Object} res - http response
 * @return {Promise} - promise that the email has been sent and response too
 */
firewoodPermitService.completePermitTransaction = async (permit) => {
  let paygovTrackingId;
  try {
    paygovTrackingId = await paygov.completeCollection(permit.paygovToken);
  } catch (paygovError) {
    await permit.update({ status: 'Error', paygovError: paygovError.toString() });
    throw new Error('Paygov Error');
  }
  const updatedPermit = await permit.update({ paygovTrackingId, status: 'Completed', purchaseDate: new Date() });
  firewoodPermitService.generateRulesAndEmail(updatedPermit);
  return firewoodPermitService.permitResult(updatedPermit);
};

/**
 * @function sendEmail - Send permit email with the input data
 * @param {Object} savedPermit - permit object from database
 * @param {string} permitPng - permit's png buffer
 * @param {string} rulesHtml - permit rules in html format
 * @param {string} rulesText - permit rules in text format
 */
firewoodPermitService.sendEmail = (savedPermit, permitPng, rulesHtml, rulesText) => {
  const attachments = [
    {
      filename: 'permit.png',
      content: Buffer.from(permitPng, 'utf-8'),
      cid: 'christmas-tree-permit-image'
    },
    {
      filename: 'permit-attachment.png',
      content: Buffer.from(permitPng, 'utf-8')
    },
    {
      filename: 'permit-rules.html',
      content: Buffer.from(rulesHtml, 'utf-8'),
      contentType: 'text/html'
    },
    {
      filename: 'permit-rules.txt',
      content: Buffer.from(rulesText, 'utf-8')
    }
  ];

  return email.sendEmail('christmasTreesPermitCreated', savedPermit, attachments);
};

/**
 * @function permitExpireDate - Private function to check if permit expire date is in future
 * @param {date} permitExpireDate - expiration date
 * @return {boolean} - expiration date is is after current date
 */
firewoodPermitService.checkPermitValid = permitExpireDate => moment(permitExpireDate).isAfter(moment());

module.exports = firewoodPermitService;

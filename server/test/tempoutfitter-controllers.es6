'use strict';

const _ = require('lodash');
const assert = require('chai').assert;
const expect = require('chai').expect;
const nock = require('nock');
const request = require('supertest');
const sinon = require('sinon');

const ApplicationFile = require('../src/models/application-files.es6');
const server = require('./mock-aws-app.es6');
const tempOutfitterPermitApplicationFactory = require('./data/tempoutfitter-permit-application-factory.es6');
const util = require('../src/util.es6');
const vcapConstants = require('../src/vcap-constants.es6');

const fileUploadUrl = '/permits/applications/special-uses/temp-outfitter/file';
const tempoutfitterUrl = '/permits/applications/special-uses/temp-outfitter';

const invalidIntakeControlNumber = 'ab69a474-aaaa-aaaa-aaaa-e9de93d92c10';
let intakeControlNumber;

describe('tempoutfitter controllers', () => {
  it('POST should return a 201 status code and an intakeControlNumber', done => {
    const permitApplication = tempOutfitterPermitApplicationFactory.create();
    request(server)
      .post(tempoutfitterUrl)
      .send(permitApplication)
      .expect('Content-Type', /json/)
      .expect(/"applicationId":[\d]+/)
      .expect(res => {
        intakeControlNumber = res.body.appControlNumber;
      })
      .expect(201, done);
  });

  it('GET should return a 200 status code with a valid intakeControlNumber', done => {
    request(server)
      .get(`${tempoutfitterUrl}/${intakeControlNumber}`)
      .expect('Content-Type', /json/)
      .expect(/"applicationId":[\d]+/)
      .expect(200, done);
  });

  it('GET should return a 404 status code when the intakeControlNumber is not found', done => {
    request(server)
      .get(`${tempoutfitterUrl}/${invalidIntakeControlNumber}`)
      .expect(404, done);
  });

  // it('GET should return a 500 status code when the intakeControlNumber is malformed', done => {
  //   request(server)
  //     .get(tempoutfitterUrl + '/' + 'imalformedControlNumber')
  //     .expect(500, done);
  // });

  it('PUT should return a 200 status code when the status is Submitted', done => {
    request(server)
      .put(`${tempoutfitterUrl}/${intakeControlNumber}`)
      .send(tempOutfitterPermitApplicationFactory.create({ status: 'Submitted' }))
      .expect('Content-Type', /json/)
      .expect(/"applicationId":[\d]+/)
      .expect(200, done);
  });

  it('PUT should return a 200 status code when the status is Cancelled', done => {
    request(server)
      .put(`${tempoutfitterUrl}/${intakeControlNumber}`)
      .send(tempOutfitterPermitApplicationFactory.create({ status: 'Cancelled' }))
      .expect('Content-Type', /json/)
      .expect(/"applicationId":[\d]+/)
      .expect(200, done);
  });

  it('PUT should return a 200 status code when the status is Hold', done => {
    request(server)
      .put(`${tempoutfitterUrl}/${intakeControlNumber}`)
      .send(tempOutfitterPermitApplicationFactory.create({ status: 'Hold', applicantMessage: 'Hold it, buddy.' }))
      .expect('Content-Type', /json/)
      .expect(/"applicationId":[\d]+/)
      .expect(200, done);
  });

  it('PUT should return a 200 status code when the status is Review', done => {
    request(server)
      .put(`${tempoutfitterUrl}/${intakeControlNumber}`)
      .send(tempOutfitterPermitApplicationFactory.create({ status: 'Review' }))
      .expect('Content-Type', /json/)
      .expect(/"applicationId":[\d]+/)
      .expect(200, done);
  });

  it('PUT should return a 400 status code when the status is Bananas', done => {
    request(server)
      .put(`${tempoutfitterUrl}/${intakeControlNumber}`)
      .send(tempOutfitterPermitApplicationFactory.create({ status: 'Bananas' }))
      .expect('Content-Type', /json/)
      .expect(res => {
        assert.lengthOf(res.body.errors, 1);
        assert.equal(res.body.errors[0].message, 'status is invalid');
      })
      .expect(400, done);
  });

  it('PUT should return a 200 status code when status is Accepted and a successful middle layer POST', done => {
    nock.cleanAll();
    nock(vcapConstants.middleLayerBaseUrl)
      .post('/auth')
      .reply(200, { token: 'auth-token' });
    nock(vcapConstants.middleLayerBaseUrl)
      .post('/permits/applications/special-uses/commercial/temp-outfitters/')
      .reply(200, { controlNumber: '1999' });
    request(server)
      .put(`${tempoutfitterUrl}/${intakeControlNumber}`)
      .send(tempOutfitterPermitApplicationFactory.create({ status: 'Accepted' }))
      .expect('Content-Type', /json/)
      .expect(/"applicationId":[\d]+/)
      .expect(200, done);
  });

  it('GET should return a 200 status code, a status of Accepted, a middle layer control number, and a revision history', done => {
    request(server)
      .get(`${tempoutfitterUrl}/${intakeControlNumber}`)
      .expect('Content-Type', /json/)
      .expect(res => {
        assert.equal(res.body.controlNumber, '1999');
        assert.equal(res.body.status, 'Accepted');
        assert.equal(res.body.revisions.length, 5);
        assert.equal(res.body.revisions[0].status, 'Submitted');
        assert.equal(res.body.revisions[1].status, 'Cancelled');
        assert.equal(res.body.revisions[2].status, 'Hold');
        assert.equal(res.body.revisions[3].status, 'Review');
        assert.equal(res.body.revisions[4].status, 'Accepted');
      })
      .expect(200, done);
  });

  it('DELETE should return a 404 status code', done => {
    request(server)
      .delete(`${tempoutfitterUrl}/${intakeControlNumber}`)
      .expect(404, done);
  });
});

//
// describe('temp outfitter server tests', () => {
//   let testApp;
//
//   it('should return a 201 response and a db generated applicationId', done => {
//     request(server)
//       .post(url)
//       .set('Accept', 'application/json')
//       .send(tempOutfitterPermitApplicationFactory.create())
//       .expect('Content-Type', /json/)
//       .expect(/"applicationId":[\d]+/)
//       .expect(201, (err, res) => {
//         if (err) return done(err);
//         testApp = res.body;
//         done();
//       });
//   });
//
//   it('should return a 400 response and a name required error', done => {
//     request(server)
//       .post(url)
//       .set('Accept', 'application/json')
//       .send(
//         tempOutfitterPermitApplicationFactory.create({
//           'applicantInfo.primaryFirstName': undefined
//         })
//       )
//       .expect('Content-Type', /json/)
//       .expect(/"required-applicantInfo.primaryFirstName"/)
//       .expect(400, done);
//   });
//
//   describe('getApplicationFileNames', () => {
//     let appId = 'appId';
//     let app = { appId };
//     let findAll;
//     beforeEach(() => {
//       findAll = sinon.stub(ApplicationFile, 'findAll').resolves(app);
//     });
//     afterEach(() => {
//       findAll.restore();
//     });
//     it('GET /:appId/files should return all application file names', done => {
//       request(server)
//         .get(`${url}/${appId}/files`)
//         .expect(200, (err, res) => {
//           expect(res.body.appId).to.equal(app.appId);
//           done();
//         });
//     });
//     it('GET /:appId/files should return a 404 not found if the application can not be found', done => {
//       findAll.restore();
//       findAll = sinon.stub(ApplicationFile, 'findAll').resolves();
//       request(server)
//         .get(`${url}/${appId}/files`)
//         .expect(404, done);
//     });
//     it('GET /:appId/files should return a 500 if an error occurs', done => {
//       let error = 'No way, no how';
//       findAll.restore();
//       findAll = sinon.stub(ApplicationFile, 'findAll').rejects(new Error(error));
//       request(server)
//         .get(`${url}/${appId}/files`)
//         .expect(500, (err, res) => {
//           expect(res.body).to.equal(error);
//           done();
//         });
//     });
//   });
//
//   describe(`POST ${postFileURL} accepts a file`, () => {
//     it('should accept a guide-document file and return 201 created', done => {
//       request(server)
//         .post(postFileURL)
//         .type('multipart/form-data')
//         .field('applicationId', testApp.applicationId)
//         .field('documentType', 'guide-document')
//         .set('Accept', 'text/html')
//         .attach('file', './test/data/test.docx')
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":"[\d]+"/)
//         .expect(201, err => {
//           expect(err).to.be.null;
//           done(err);
//         });
//     });
//     it('should accept a good-standing-evidence file and return 201 created', done => {
//       request(server)
//         .post(postFileURL)
//         .type('multipart/form-data')
//         .field('applicationId', testApp.applicationId)
//         .field('documentType', 'good-standing-evidence')
//         .set('Accept', 'text/html')
//         .attach('file', './test/data/test.docx')
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":"[\d]+"/)
//         .expect(201, err => {
//           expect(err).to.be.null;
//           done(err);
//         });
//     });
//     it('should accept a acknowledgement-of-risk-form file and return 201 created', done => {
//       request(server)
//         .post(postFileURL)
//         .type('multipart/form-data')
//         .field('applicationId', testApp.applicationId)
//         .field('documentType', 'acknowledgement-of-risk-form')
//         .set('Accept', 'text/html')
//         .attach('file', './test/data/test.docx')
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":"[\d]+"/)
//         .expect(201, err => {
//           expect(err).to.be.null;
//           done(err);
//         });
//     });
//     it('should accept a insurance-certificate file and return 201 created', done => {
//       request(server)
//         .post(postFileURL)
//         .type('multipart/form-data')
//         .field('applicationId', testApp.applicationId)
//         .field('documentType', 'insurance-certificate')
//         .set('Accept', 'text/html')
//         .attach('file', './test/data/test.docx')
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":"[\d]+"/)
//         .expect(201, err => {
//           expect(err).to.be.null;
//           done(err);
//         });
//     });
//     it('should accept a operating-plan file and return 201 created', done => {
//       request(server)
//         .post(postFileURL)
//         .type('multipart/form-data')
//         .field('applicationId', testApp.applicationId)
//         .field('documentType', 'operating-plan')
//         .set('Accept', 'text/html')
//         .attach('file', './test/data/test.docx')
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":"[\d]+"/)
//         .expect(201, err => {
//           expect(err).to.be.null;
//           done(err);
//         });
//     });
//     it('should return a 500 error and an error message if an error occurs', done => {
//       let error = 'nope';
//       sinon.stub(ApplicationFile, 'create').rejects(new Error(error));
//       request(server)
//         .post(postFileURL)
//         .type('multipart/form-data')
//         .field('applicationId', testApp.applicationId)
//         .field('documentType', 'guide-document')
//         .set('Accept', 'text/html')
//         .attach('file', './test/data/test.docx')
//         .expect(500, done);
//     });
//   });
//
//   describe(`PUT ${url}/:uuid updates an application`, () => {
//     it('should return 200 and the updated application', done => {
//       let testData = _.clone(testApp);
//       testData.applicantInfo.website = 'http://super.site';
//       request(server)
//         .put(`${url}/${testApp.appControlNumber}`)
//         .set('Accept', 'application/json')
//         .send(testData)
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":[\d]+/)
//         .expect(200, done);
//     });
//
//     it('should return 200 and the updated cancelled application', done => {
//       let testData = _.clone(testApp);
//       testData.status = 'Cancelled';
//       request(server)
//         .put(`${url}/${testApp.appControlNumber}`)
//         .set('Accept', 'application/json')
//         .send(testData)
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":[\d]+/)
//         .expect(200, done);
//     });
//
//     it('should return 200 and the updated on hold application', done => {
//       let testData = _.clone(testApp);
//       testData.status = 'Hold';
//       request(server)
//         .put(`${url}/${testApp.appControlNumber}`)
//         .set('Accept', 'application/json')
//         .send(testData)
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":[\d]+/)
//         .expect(200, done);
//     });
//
//     it('should return 200 and the updated on review application', done => {
//       let testData = _.clone(testApp);
//       testData.status = 'Review';
//       request(server)
//         .put(`${url}/${testApp.appControlNumber}`)
//         .set('Accept', 'application/json')
//         .send(testData)
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":[\d]+/)
//         .expect(200, done);
//     });
//
//     it('should accept an application return 200 and the updated application', done => {
//       let testData = _.clone(testApp);
//       testData.applicantInfo.website = 'http://super.site';
//       testData.status = 'Accepted';
//       const middleLayerAuth = sinon.stub(util, 'middleLayerAuth').resolves('atoken');
//       const req = sinon.stub(util, 'request').resolves({ name: 'body' });
//       request(server)
//         .put(`${url}/${testApp.appControlNumber}`)
//         .set('Accept', 'application/json')
//         .send(testData)
//         .expect('Content-Type', /json/)
//         .expect(/"applicationId":[\d]+/)
//         .expect(200, err => {
//           middleLayerAuth.restore();
//           req.restore();
//           done(err);
//         });
//     });
//
//     it('should not accept an application return 500 if middleLayerAuth fails', done => {
//       let testData = _.clone(testApp);
//       testData.applicantInfo.website = 'http://super.site';
//       testData.status = 'Accepted';
//       const middleLayerAuth = sinon.stub(util, 'middleLayerAuth').callsFake(function() {
//         return new Promise((resolve, reject) => {
//           reject(new Error('Not gonna happen'));
//         });
//       });
//       request(server)
//         .put(`${url}/${testApp.appControlNumber}`)
//         .set('Accept', 'application/json')
//         .send(testData)
//         .expect('Content-Type', /json/)
//         .expect(500, err => {
//           middleLayerAuth.restore();
//           done(err);
//         });
//     });
//
//     it('should not accept an application return 500 if call to middle layer fails', done => {
//       let testData = _.clone(testApp);
//       testData.applicantInfo.website = 'http://super.site';
//       testData.status = 'Accepted';
//       const middleLayerAuth = sinon.stub(util, 'middleLayerAuth').resolves('atoken');
//       const req = sinon.stub(util, 'request').rejects({ statusCode: 500 });
//       request(server)
//         .put(`${url}/${testApp.appControlNumber}`)
//         .set('Accept', 'application/json')
//         .send(testData)
//         .expect('Content-Type', /json/)
//         .expect(500, err => {
//           middleLayerAuth.restore();
//           req.restore();
//           done(err);
//         });
//     });
//   });
// });

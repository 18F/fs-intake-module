

const expect = require('chai').expect;
const sinon = require('sinon');

const vcapConstants = require('../src/vcap-constants.es6');
const util = require('../src/services/util.es6');

describe('util tests', () => {
  describe('getContentType', () => {
    it('should return the correct content-type', () => {
      const types = {
        pdf: 'application/pdf',
        rtf: 'application/rtf',
        doc: 'application/msword',
        docx: 'application/msword',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.ms-excel'
      };
      for (const ext in types) {
        expect(util.getContentType(ext)).to.equal(types[ext]);
      }
    });
  });

  describe('middleLayerAuth', () => {
    let postStub;
    before(() => (postStub = sinon.stub(util, 'request')));
    after(() => postStub.restore());
    it('should successfully post an auth the middle layer', (done) => {
      const token = 'token';
      postStub.resolves(token);
      util.middleLayerAuth().then((_token) => {
        expect(_token).to.equal(token);
        done();
      });
    });
    it('should post an auth the middle layer and fail gracefully on error', (done) => {
      const err = new Error('kaboom');
      postStub.rejects(err);
      util.middleLayerAuth().catch((_err) => {
        expect(_err).to.equal(err);
        done();
      });
    });
    it('should post an auth the middle layer and fail gracefully if statusCode is not 200', (done) => {
      const res = {
        statusCode: 400
      };
      postStub.rejects(res);
      util.middleLayerAuth().catch((_res) => {
        expect(_res).to.equal(res);
        done();
      });
    });

    it('should return admin role', () => {
      expect(util.getUserRole('FS_OpenForest_Super-User')).to.equal('admin');
    });

    it('should return user role', () => {
      expect(util.getUserRole('FS_OpenForest_Read')).to.equal('user');
    });

    it('should get admin forests', () => {
      expect(util.getAdminForests('TEST_USER')[0]).to.equal('arp');
    });
  });

  describe('userApplicationLink', () => {
    it('should return the correct noncommericial application url and accompanying link text', () => {
      const statuses = [
        { state: 'Accepted', text: 'accepted application' },
        { state: 'Rejected', text: 'application' },
        { state: 'Hold', text: 'application which needs additional information' },
        { state: 'Review', text: 'application which is under review' },
        { state: 'Cancelled', text: 'cancelled application' },
        { state: 'Submitted', text: 'submitted application' }
      ];
      const testApp = {
        type: 'noncommercial',
        appControlNumber: '1d1ae92b-c1da-4933-9425-d64cad5561dd'
      };
      const url = vcapConstants.INTAKE_CLIENT_BASE_URL;

      statuses.forEach((status) => {
        testApp.status = status.state;
        const userLink = util.userApplicationLink(testApp, true);
        expect(userLink.text).to.equal(
          `You can view your ${status.text} here`
        );

        expect(userLink.url).to.equal(
          `${url}/user/applications/noncommercial/1d1ae92b-c1da-4933-9425-d64cad5561dd`
        );
      });
    });

    it('should return the correct noncommericial application url and accompanying link text', () => {
      const statuses = [
        { state: 'Accepted', text: 'accepted application' },
        { state: 'Rejected', text: 'application' },
        { state: 'Hold', text: 'application which needs additional information' },
        { state: 'Review', text: 'application which is under review' },
        { state: 'Cancelled', text: 'cancelled application' },
        { state: 'Submitted', text: 'submitted application' }
      ];
      const testApp = {
        type: 'tempOutfitters',
        appControlNumber: '1d1ae92b-c1da-4933-9425-d64cad5561dd'
      };
      const url = vcapConstants.INTAKE_CLIENT_BASE_URL;

      statuses.forEach((status) => {
        testApp.status = status.state;
        const userLink = util.userApplicationLink(testApp, true);
        expect(userLink.text).to.equal(
          `You can view your ${status.text} here`
        );

        expect(userLink.url).to.equal(
          `${url}/user/applications/temp-outfitter/1d1ae92b-c1da-4933-9425-d64cad5561dd`
        );
      });
    });
  });
});

import { browser, element, by, Key } from 'protractor';

import { ChristmasTreeOrderConfirmation } from './christmas-tree-form-confirmation.po';
import { ChristmasTreeForm } from './christmas-tree-form.po';

xdescribe('Apply for a Christmas tree permit', () => {
  let christmasTreeForm: ChristmasTreeForm;
  let confirmPage: {};
  confirmPage = ChristmasTreeOrderConfirmation;
  const forestId = 'mthood';

  xdescribe('fill out basic user info', () => {
    beforeEach(() => {
      christmasTreeForm = new ChristmasTreeForm();
    });

    xit('should display the permit name in the header', () => {
      christmasTreeForm.navigateTo(forestId);
      expect<any>(element(by.css('app-root h1')).getText()).toEqual('Buy a Christmas tree permit');
    });

    xit('should show the breadcrumb', () => {
      expect<any>(element(by.css('nav')).isPresent()).toBeTruthy();
    });
  });

});

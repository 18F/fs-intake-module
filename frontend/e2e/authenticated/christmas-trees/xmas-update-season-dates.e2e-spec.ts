import { browser, element, by, protractor } from 'protractor';
import { loginAdmin } from '../../support/auth-helper';
import { TreesAdminDatesPage } from './xmas-tree-admin-dates.po';

const page = new TreesAdminDatesPage();

describe('Xmas tree - Update Season Dates', () => {
  describe('Season dates admin page', () => {
    beforeAll(() => {
      browser.driver.manage().deleteAllCookies();
      browser.driver.manage().window().setSize(1400, 900);

      page.navigateTo();

      loginAdmin();

      expect<any>(browser.getCurrentUrl()).toEqual(browser.baseUrl + '/christmas-trees/admin/season-dates');
    });

    describe('basic elements', () => {
      it('should display a start date', () => {
        expect<any>(page.startMonthInput().isPresent()).toBeTruthy();
        expect<any>(page.startDayInput().isPresent()).toBeTruthy();
        expect<any>(page.startYearInput().isPresent()).toBeTruthy();
      });

      it('should display an end date', () => {
        expect<any>(page.endMonthInput().isPresent()).toBeTruthy();
        expect<any>(page.endDayInput().isPresent()).toBeTruthy();
        expect<any>(page.endYearInput().isPresent()).toBeTruthy();
      });
    });

    describe('forest select', () => {
      it('should allow the user to select a forest', () => {
        element(by.id('3-button-label')).click();
        element(by.id('update-dates')).click();

      });

      it('should clear the errors after a forest is selected', () => {
        expect<any>(page.startMonthError().isPresent()).toBeFalsy();
        expect<any>(page.startDayError().isPresent()).toBeFalsy();
        expect<any>(page.startYearError().isPresent()).toBeFalsy();
        expect<any>(page.endMonthError().isPresent()).toBeFalsy();
        expect<any>(page.endDayError().isPresent()).toBeFalsy();
        expect<any>(page.endYearError().isPresent()).toBeFalsy();
      });

      it('should show date invalid errors if dates are invalid', () => {
        page.startMonthInput().clear();
        page.startMonthInput().sendKeys('13');
        page.startMonthInput().sendKeys(protractor.Key.TAB);
        expect<any>(page.startMonthError().getText()).toEqual('Start month requires a 1 or 2 digit number that is less than 13.');
        page.startMonthInput().clear();
        page.startMonthInput().sendKeys('10');
        expect<any>(page.startMonthError().isPresent()).toBeFalsy();

        page.startDayInput().clear();
        page.startDayInput().sendKeys('33');
        page.startDayInput().sendKeys(protractor.Key.TAB);
        expect<any>(page.startDayError().getText()).toEqual('Start day requires a 1 or 2 digit number.');
        page.startDayInput().clear();
        page.startDayInput().sendKeys('10');
        expect<any>(page.startDayError().isPresent()).toBeFalsy();
      });

      it('should display error if start date is after end date', () => {
        page.startYearInput().clear();
        page.startYearInput().sendKeys('2040');
        expect<any>(page.startDateTimeError().getText()).toEqual(
          'Start date and time must be before end date and time.'
        );
        page.startYearInput().clear();
        page.startYearInput().sendKeys('2014');
        expect<any>(page.startDateTimeError().isPresent()).toBeFalsy();
      });
    });
   });
});

import { Injectable } from '@angular/core';
import * as moment from 'moment/moment';

@Injectable()
export class DateTimeRangeService {


  /**
   * Combine individual date fields to one moment date/time object
   * @returns      moment object
   */
  parseDateTime(year, month, day) {
    return moment(`${year}-${month}-${day}`, 'YYYY-MM-DD');
  }

  /**
   *  Return true if has start dates but no end dates
   */
  checkHasStartAndNoEnd(values) {
    return (
      values.startMonth &&
      values.startDay &&
      (values.startYear && values.startYear.toString().length === 4) &&
      !values.endMonth &&
      !values.endDay &&
      !values.endYear
    );
  }

  /**
   *  Return true if all date time fields are filled in
   */
  checkHasAllDateValues(values) {
    return (
      values.startMonth &&
      values.startDay &&
      values.startYear && values.startYear.toString().length === 4 &&
      values.endMonth &&
      values.endDay &&
      values.endYear
    );
  }
}

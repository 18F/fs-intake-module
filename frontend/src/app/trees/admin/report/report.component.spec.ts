import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReportComponent } from './report.component';
import { ApplicationFieldsService } from '../../../application-forms/_services/application-fields.service';
import { RouterTestingModule } from '@angular/router/testing';
import { ChristmasTreesApplicationService } from '../../_services/christmas-trees-application.service';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UtilService } from '../../../_services/util.service';
import { Observable } from 'rxjs/Observable';
import { ChristmasTreesAdminService } from '../christmas-trees-admin.service';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment/moment';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let formBuilder: FormBuilder;

  const mockActivatedRoute = {
    params: Observable.of({ id: 1 }),
    data: Observable.of({
      forests: [
        {
          id: 1,
          forestName: 'Arapaho and Roosevelt National Forests',
          forestNameShort: 'Arapaho and Roosevelt',
          description: 'Arapaho & Roosevelt | Colorado | Fort Collins, CO',
          forestAbbr: 'arp',
          startDate: '10/30/2018',
          endDate: '9/30/2019'
        },
        {
          id: 2,
          forestName: 'Flathead National Forest',
          forestNameShort: 'Flathead',
          description: 'Flathead | Montana | Kalispell, MT',
          forestAbbr: 'flathead',
          startDate: '10/31/2018',
          endDate: '9/30/2019'
        },
        {
          id: 3,
          forestName: 'Mt. Hood National Forest',
          forestNameShort: 'Mt. Hood',
          description: 'Mt. Hood | Oregon | Portland, OR',
          forestAbbr: 'mthood'
        },
        {
          id: 4,
          forestName: 'Shoshone National Forest',
          forestNameShort: 'Shoshone',
          description: 'Shoshone | Montana, Wyoming | Cody, WY, Jackson, WY',
          forestAbbr: 'shoshone'
        }
      ]
    })
  };

  class MockApplicationService {
    getAllByDateRange(): Observable<{}> {
      return Observable.of({
        parameters: {
          forestName: 'Arapaho and Roosevelt National Forests',
          startDate: '10/10/2018',
          endDate: '10/10/2019',
          sumOfTrees: '12',
          sumOfCost: '100'
        }
      });
    }

    getReportByPermitNumber(): Observable<{}> {
      return Observable.of({
        parameters: {
          sumOfTrees: '12',
          sumOfCost: '100'
        },
        permits: [{ forestId: 1, quantity: 1, totalCost: '5' }]
      });
    }
  }

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ReportComponent],
        providers: [
          ApplicationFieldsService,
          { provide: ChristmasTreesApplicationService, useClass: MockApplicationService },
          FormBuilder,
          ChristmasTreesAdminService,
          UtilService,
          Title
        ],
        imports: [RouterTestingModule, HttpClientTestingModule],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.debugElement.componentInstance;
    formBuilder = new FormBuilder();
    const dateTimeRangeForm = formBuilder.group({
      endDateTime: [''],
      endDay: [''],
      endMonth: [''],
      endYear: [''],
      endHour: [''],
      endMinutes: ['00'],
      endPeriod: [''],
      startDateTime: [''],
      startDay: [''],
      startMonth: [''],
      startYear: [''],
      startHour: [''],
      startMinutes: ['00'],
      startPeriod: ['']
    });
    component.form.addControl('dateTimeRange', dateTimeRangeForm);
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get forest by id', () => {
    const forest = component.getForestById('2');
    expect(forest.forestName).toEqual('Flathead National Forest');
  });

  it('should get report', () => {
    component.result = {};
    component.isDateSearch = true;
    component.selectedForest = '1';

    component.dateStatus.hasErrors = false;
    component.form.get('forestSelection').setValue('1');
    component.form.get('dateTimeRange.startMonth').setValue('10');
    component.form.get('dateTimeRange.startDay').setValue('10');
    component.form.get('dateTimeRange.startYear').setValue('2017');
    component.form.get('dateTimeRange.endMonth').setValue('10');
    component.form.get('dateTimeRange.endDay').setValue('10');
    component.form.get('dateTimeRange.endYear').setValue('2018');
    expect(component.form.valid).toBeTruthy();
    component.getReport();
    expect(component.result.parameters.forestNameShort).toEqual('Arapaho and Roosevelt');
  });

  it('should update date status', () => {
    component.updateDateStatus({
      startDateTimeValid: false,
      endDateTimeValid: false,
      startBeforeEnd: false,
      startAfterToday: false,
      hasErrors: false,
      dateTimeSpan: 0
    });
    expect(component.dateStatus).toEqual({
      startDateTimeValid: false,
      endDateTimeValid: false,
      startBeforeEnd: false,
      startAfterToday: false,
      hasErrors: false,
      dateTimeSpan: 0
    });
  });

  it('should set start and end dates', () => {
    component.selectedForest = '2';

    component.setStartEndDate(component.selectedForest, component.form);
    expect(component.form.get('dateTimeRange.startMonth').value).toEqual('10');
    expect(component.form.get('dateTimeRange.startDay').value).toEqual('31');
    expect(component.form.get('dateTimeRange.startYear').value).toEqual('2018');
    expect(component.form.get('dateTimeRange.endMonth').value).toEqual('09');
    expect(component.form.get('dateTimeRange.endDay').value).toEqual('30');
    expect(component.form.get('dateTimeRange.endYear').value).toEqual('2019');

    component.selectedForest = '5';
    component.setStartEndDate(component.selectedForest, component.form);
    expect(component.form.get('dateTimeRange.endYear').value).toEqual(String(moment().year()));
  });

  it('should get report by permit number', () => {
    component.result = {};
    component.isDateSearch = false;
    component.selectedForest = null;
    component.permitNumberSearchForm.get('permitNumber').setValue('11111111');
    expect(component.permitNumberSearchForm.valid).toBeTruthy();
    component.getPermitByNumber();
    expect(component.result.permits[0].forestId).toEqual(1);
  });
});

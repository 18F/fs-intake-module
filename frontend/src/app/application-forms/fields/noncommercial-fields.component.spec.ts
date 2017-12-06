import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { inject, TestBed, getTestBed, async, fakeAsync, ComponentFixture } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NoncommercialFieldsComponent } from './noncommercial-fields.component';
import { ApplicationFieldsService } from '../_services/application-fields.service';
import { TestService } from '../../_services/test.service';

@Component({
  selector: 'app-test-component-wrapper',
  template: '<app-noncommercial-fields [parentForm]="applicationForm"></app-noncommercial-fields>'
})
class TestComponentWrapperComponent {
  applicationForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.applicationForm = this.formBuilder.group({});
  }
}

describe('noncommercial fields', () => {
  let component: NoncommercialFieldsComponent;
  let fixture: ComponentFixture<TestComponentWrapperComponent>;
  let testService: TestService;

  beforeEach(
    async(() => {
      testService = new TestService();
      testService.configureTestingModule(
        [NoncommercialFieldsComponent, TestComponentWrapperComponent],
        [FormBuilder, ApplicationFieldsService]
      );

      fixture = TestBed.createComponent(TestComponentWrapperComponent);
      component = fixture.debugElement.children[0].componentInstance;
      fixture.detectChanges();
    })
  );

  it('should be valid if participants is greater than 0', () => {
    component.noncommercialFields.controls['numberParticipants'].setValue(1);
    expect(component.noncommercialFields.controls['numberParticipants'].valid).toBeTruthy();
  });

  it('should be invalid if participants is less than 1', () => {
    component.noncommercialFields.controls['numberParticipants'].setValue(0);
    expect(component.noncommercialFields.controls['numberParticipants'].valid).toBeFalsy();
  });

  it('should be invalid if paticipants is 0 and spectators is greater than 0', () => {
    component.noncommercialFields.controls['numberParticipants'].setValue(0);
    component.noncommercialFields.controls['numberSpectators'].setValue(1);
    component.noncommercialFields.controls['activityDescription'].setValue('test');
    component.noncommercialFields.controls['locationDescription'].setValue('test');
    expect(component.noncommercialFields.valid).toBeFalsy();
  });

  it('should be valid if paticipants is greater than 0 and spectators is greater than 0', () => {
    component.noncommercialFields.controls['numberParticipants'].setValue(1);
    component.noncommercialFields.controls['numberSpectators'].setValue(1);
    component.noncommercialFields.controls['activityDescription'].setValue('test');
    component.noncommercialFields.controls['locationDescription'].setValue('test');
    expect(component.noncommercialFields.valid).toBeTruthy();
  });
});

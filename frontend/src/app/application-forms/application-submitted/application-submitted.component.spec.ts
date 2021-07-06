import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationSubmittedComponent } from './application-submitted.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MockActivatedRoute, MockRouter } from '../../_mocks/routes.mock';
import { Observable, of, throwError } from 'rxjs';
import { noncommercialMock } from '../application-noncommercial-group/noncommercial.mock';
import { ApplicationService } from '../../_services/application.service';
import { HttpClientModule } from '@angular/common/http';

export class MockApplicationService {
  getOne(id): Observable<{}> {
    if (id === '111') {
      return of(noncommercialMock);
    } else {
      return throwError(['Server Error']);
    }
  }
}

describe('ApplicationSubmittedComponent', () => {
  let component: ApplicationSubmittedComponent;
  let fixture: ComponentFixture<ApplicationSubmittedComponent>;
  let mockActivatedRoute: MockActivatedRoute;
  let mockRouter: MockRouter;

  beforeEach(
    async(() => {
      mockActivatedRoute = new MockActivatedRoute({ test: 'route' });
      mockRouter = new MockRouter();
      TestBed.configureTestingModule({
        declarations: [ApplicationSubmittedComponent],
        providers: [
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
          { provide: Router, useValue: mockRouter },
          { provide: ApplicationService, useClass: MockApplicationService }
        ],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [HttpClientModule]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationSubmittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

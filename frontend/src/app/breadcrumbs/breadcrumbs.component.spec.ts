import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcrumbsComponent } from './breadcrumbs.component';
import { McBreadcrumbsConfig, McBreadcrumbsService } from 'ngx6-angular-breadcrumbs';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';

@Component({
  template: `<app-breadcrumbs id="test" ></app-breadcrumbs>`
})
class TestBreadcrumbsComponent {
}

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;
  let router: Router;
  let breadcrumbElement: DebugElement;
  let breadcrumbService: any;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'home', component: TestBreadcrumbsComponent, data: { breadcrumbs: 'test' } }
        ])],
        declarations: [BreadcrumbsComponent, TestBreadcrumbsComponent],
        providers: [McBreadcrumbsService, McBreadcrumbsConfig]
      }).compileComponents();
      breadcrumbService = TestBed.get(McBreadcrumbsService);
      spyOn(breadcrumbService, 'crumbs$').and.returnValue(of([{text: 'test', path: null}]));

    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    router.initialNavigation();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prove and bake up a breadcrumb', () => {
    breadcrumbElement = fixture.debugElement.query(By.css('.breadcrumbs'));
    expect(breadcrumbElement).toBeTruthy();
    expect(component.crumbs).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FilterPipe } from '../../../../_pipes/filter.pipe';
import { forest } from '../../../../_mocks/forest.mock';
import { TreeRulesComponent } from './tree-rules.component';
import { SpacesToDashesPipe } from '../../../../_pipes/spaces-to-dashes.pipe';
import { UtilService } from '../../../../_services/util.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChristmasTreesInfoService } from '../../../_services/christmas-trees-info.service';

describe('TreeRulesComponent', () => {
  let component: TreeRulesComponent;
  let fixture: ComponentFixture<TreeRulesComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [TreeRulesComponent, FilterPipe, SpacesToDashesPipe],
        providers: [UtilService, ChristmasTreesInfoService],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [HttpClientTestingModule]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeRulesComponent);
    component = fixture.componentInstance;
    component.forest = forest;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

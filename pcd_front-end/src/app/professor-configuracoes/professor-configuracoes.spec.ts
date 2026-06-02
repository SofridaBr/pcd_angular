import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessorConfiguracoes } from './professor-configuracoes';

describe('ProfessorConfiguracoes', () => {
  let component: ProfessorConfiguracoes;
  let fixture: ComponentFixture<ProfessorConfiguracoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessorConfiguracoes],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessorConfiguracoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

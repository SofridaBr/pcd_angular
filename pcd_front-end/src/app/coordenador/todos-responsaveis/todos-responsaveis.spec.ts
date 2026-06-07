import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosResponsaveis } from './todos-responsaveis';

describe('TodosResponsaveis', () => {
  let component: TodosResponsaveis;
  let fixture: ComponentFixture<TodosResponsaveis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosResponsaveis],
    }).compileComponents();

    fixture = TestBed.createComponent(TodosResponsaveis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

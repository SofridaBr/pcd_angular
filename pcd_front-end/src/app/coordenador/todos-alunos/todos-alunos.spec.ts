import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosAlunos } from './todos-alunos';

describe('TodosAlunos', () => {
  let component: TodosAlunos;
  let fixture: ComponentFixture<TodosAlunos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosAlunos],
    }).compileComponents();

    fixture = TestBed.createComponent(TodosAlunos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

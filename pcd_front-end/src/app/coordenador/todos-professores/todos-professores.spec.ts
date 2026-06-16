import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosProfessores } from './todos-professores';

describe('TodosProfessores', () => {
  let component: TodosProfessores;
  let fixture: ComponentFixture<TodosProfessores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosProfessores],
    }).compileComponents();

    fixture = TestBed.createComponent(TodosProfessores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

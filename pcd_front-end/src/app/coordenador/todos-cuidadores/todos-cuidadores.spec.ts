import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosCuidadores } from './todos-cuidadores';

describe('TodosCuidadores', () => {
  let component: TodosCuidadores;
  let fixture: ComponentFixture<TodosCuidadores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosCuidadores],
    }).compileComponents();

    fixture = TestBed.createComponent(TodosCuidadores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

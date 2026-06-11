import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tarefa } from './tarefa';

describe('Tarefa', () => {
  let component: Tarefa;
  let fixture: ComponentFixture<Tarefa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tarefa],
    }).compileComponents();

    fixture = TestBed.createComponent(Tarefa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

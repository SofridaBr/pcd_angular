import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Professor } from './professor';

describe('Professor', () => {
  let component: Professor;
  let fixture: ComponentFixture<Professor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Professor],
    }).compileComponents();

    fixture = TestBed.createComponent(Professor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

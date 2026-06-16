import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tutoriais } from './tutoriais';

describe('Tutoriais', () => {
  let component: Tutoriais;
  let fixture: ComponentFixture<Tutoriais>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tutoriais],
    }).compileComponents();

    fixture = TestBed.createComponent(Tutoriais);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

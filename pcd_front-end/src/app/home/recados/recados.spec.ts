import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recados } from './recados';

describe('Recados', () => {
  let component: Recados;
  let fixture: ComponentFixture<Recados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recados],
    }).compileComponents();

    fixture = TestBed.createComponent(Recados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

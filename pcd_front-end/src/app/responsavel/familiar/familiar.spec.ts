import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Familiar } from './familiar';

describe('Familiar', () => {
  let component: Familiar;
  let fixture: ComponentFixture<Familiar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Familiar],
    }).compileComponents();

    fixture = TestBed.createComponent(Familiar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

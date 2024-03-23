import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialAreaComponent } from './social-area.component';

describe('SocialAreaComponent', () => {
  let component: SocialAreaComponent;
  let fixture: ComponentFixture<SocialAreaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SocialAreaComponent]
    });
    fixture = TestBed.createComponent(SocialAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

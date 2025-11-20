import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserResetPassword } from './user-reset-password';

describe('UserResetPassword', () => {
  let component: UserResetPassword;
  let fixture: ComponentFixture<UserResetPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserResetPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

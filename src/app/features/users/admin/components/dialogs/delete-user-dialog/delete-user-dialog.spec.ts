import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteUserDialog } from './delete-user-dialog';

describe('DeleteUserDialog', () => {
  let component: DeleteUserDialog;
  let fixture: ComponentFixture<DeleteUserDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteUserDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteUserDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

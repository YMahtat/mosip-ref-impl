import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RnpCustomSimpleKeyboardComponent } from './rnp-custom-simple-keyboard.component';

describe('RnpCustomSimpleKeyboardComponent', () => {
  let component: RnpCustomSimpleKeyboardComponent;
  let fixture: ComponentFixture<RnpCustomSimpleKeyboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RnpCustomSimpleKeyboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RnpCustomSimpleKeyboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

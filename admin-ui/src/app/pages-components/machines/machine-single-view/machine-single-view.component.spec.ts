import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MachineSingleViewComponent} from './machine-single-view.component';

describe('MachineSingleViewComponent', () => {
    let component: MachineSingleViewComponent;
    let fixture: ComponentFixture<MachineSingleViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MachineSingleViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MachineSingleViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

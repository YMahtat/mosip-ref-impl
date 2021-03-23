import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DeviceSingleViewComponent} from './device-single-view.component';

describe('DeviceSingleViewComponent', () => {
    let component: DeviceSingleViewComponent;
    let fixture: ComponentFixture<DeviceSingleViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [DeviceSingleViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DeviceSingleViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

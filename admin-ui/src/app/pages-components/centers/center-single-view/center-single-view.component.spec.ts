import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CenterSingleViewComponent} from './center-single-view.component';

describe('CenterSingleViewComponent', () => {
    let component: CenterSingleViewComponent;
    let fixture: ComponentFixture<CenterSingleViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CenterSingleViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CenterSingleViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

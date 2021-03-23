import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PartnerRequestSingleViewComponent} from './partner-request-single-view.component';

describe('PartnerRequestSingleViewComponent', () => {
    let component: PartnerRequestSingleViewComponent;
    let fixture: ComponentFixture<PartnerRequestSingleViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PartnerRequestSingleViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PartnerRequestSingleViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

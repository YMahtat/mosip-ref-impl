import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RnpSectionHeaderComponent} from './rnp-section-header.component';

describe('RnpSectionHeaderComponent', () => {
    let component: RnpSectionHeaderComponent;
    let fixture: ComponentFixture<RnpSectionHeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RnpSectionHeaderComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RnpSectionHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

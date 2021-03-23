import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AuthPartnerSingleViewComponent} from './auth-partner-single-view.component';

describe('AuthPartnerSingleViewComponent', () => {
    let component: AuthPartnerSingleViewComponent;
    let fixture: ComponentFixture<AuthPartnerSingleViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AuthPartnerSingleViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthPartnerSingleViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

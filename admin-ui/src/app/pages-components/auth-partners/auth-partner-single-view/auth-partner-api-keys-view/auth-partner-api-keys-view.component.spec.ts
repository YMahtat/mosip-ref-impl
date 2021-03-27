import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AuthPartnerApiKeysViewComponent} from './auth-partner-api-keys-view.component';

describe('AuthPartnerApiKeysViewComponent', () => {
    let component: AuthPartnerApiKeysViewComponent;
    let fixture: ComponentFixture<AuthPartnerApiKeysViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AuthPartnerApiKeysViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthPartnerApiKeysViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

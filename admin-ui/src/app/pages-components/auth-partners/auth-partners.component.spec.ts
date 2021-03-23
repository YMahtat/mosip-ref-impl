import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AuthPartnersComponent} from './auth-partners.component';

describe('AuthPartnersComponent', () => {
    let component: AuthPartnersComponent;
    let fixture: ComponentFixture<AuthPartnersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AuthPartnersComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthPartnersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

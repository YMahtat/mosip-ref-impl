import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AuthPartnersViewComponent} from './auth-partners-view.component';

describe('MispsViewComponent', () => {
    let component: AuthPartnersViewComponent;
    let fixture: ComponentFixture<AuthPartnersViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AuthPartnersViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthPartnersViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

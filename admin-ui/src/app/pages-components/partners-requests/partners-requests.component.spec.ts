import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PartnersRequestsComponent} from './partners-requests.component';

describe('PartnersRequestsComponent', () => {
    let component: PartnersRequestsComponent;
    let fixture: ComponentFixture<PartnersRequestsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PartnersRequestsComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PartnersRequestsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PartnersRequestsViewComponent} from './partners-requests-view.component';

describe('PartnersRequestsViewComponent', () => {
    let component: PartnersRequestsViewComponent;
    let fixture: ComponentFixture<PartnersRequestsViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PartnersRequestsViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PartnersRequestsViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

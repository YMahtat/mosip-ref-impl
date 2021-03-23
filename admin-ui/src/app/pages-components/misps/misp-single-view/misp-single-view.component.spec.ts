import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MispSingleViewComponent} from './misp-single-view.component';

describe('MispSingleViewComponent', () => {
    let component: MispSingleViewComponent;
    let fixture: ComponentFixture<MispSingleViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MispSingleViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MispSingleViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

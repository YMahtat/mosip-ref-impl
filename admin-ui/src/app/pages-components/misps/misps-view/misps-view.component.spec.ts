import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MispsViewComponent} from './misps-view.component';

describe('MispsViewComponent', () => {
    let component: MispsViewComponent;
    let fixture: ComponentFixture<MispsViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MispsViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MispsViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

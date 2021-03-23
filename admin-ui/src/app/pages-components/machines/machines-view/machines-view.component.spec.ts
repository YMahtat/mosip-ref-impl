import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MachinesViewComponent} from './machines-view.component';

describe('MachinesViewComponent', () => {
    let component: MachinesViewComponent;
    let fixture: ComponentFixture<MachinesViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MachinesViewComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MachinesViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

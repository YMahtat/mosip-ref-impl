import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TopNavComponent} from './top-nav.component';

describe('TopHeaderComponent', () => {
    let component: TopNavComponent;
    let fixture: ComponentFixture<TopNavComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TopNavComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TopNavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

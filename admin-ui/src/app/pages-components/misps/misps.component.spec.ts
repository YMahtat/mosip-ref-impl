import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MispsComponent} from './misps.component';

describe('MispsComponent', () => {
    let component: MispsComponent;
    let fixture: ComponentFixture<MispsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MispsComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MispsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

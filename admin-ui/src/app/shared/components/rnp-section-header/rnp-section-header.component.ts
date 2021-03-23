import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-rnp-section-header',
    templateUrl: './rnp-section-header.component.html',
    styleUrls: ['./rnp-section-header.component.scss']
})
export class RnpSectionHeaderComponent implements OnInit {

    @Input() sectionTitle: string | undefined;
    @Input() sectionImage: string | undefined;

    constructor() {
    }

    ngOnInit(): void {
    }

}

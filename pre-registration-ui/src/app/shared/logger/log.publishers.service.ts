import {Injectable} from '@angular/core';
import {LogPublisher} from './log.publisher';
import {LogConsole} from './log.console';

@Injectable({
    providedIn: 'root'
})
export class LogPublishersService {
    publishers: LogPublisher[] = [];

    constructor() {
        this.buildPublishers();
    }

    buildPublishers(): void {
        this.publishers.push(new LogConsole());
    }
}

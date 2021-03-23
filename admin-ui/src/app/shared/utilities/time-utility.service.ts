import {DatePipe} from '@angular/common';

/**
 * services imported from mosip admin-ui source-code !
 * to refactor if necessary !!
 */
export class TimeUtilityService {

    public static getDateInMosipFormat(dateToFormat: string): string {
        const date = new Date(dateToFormat);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }

    public static formatDate(date: Date): string | null {
        const pipe = new DatePipe('en-US');
        return pipe.transform(date, 'yyyy-MM-dd');
    }

    public static getCurrentDate(): string {
        const now = new Date();
        const pipe = new DatePipe('en-US');
        let formattedDate = pipe.transform(now, 'yyyy-MM-ddTHH:mm:ss.SSS');
        formattedDate = formattedDate + 'Z';
        return formattedDate;
    }

    public static minuteIntervals(start: number, end: number, interval: number): number[] {
        const intervals = [];
        for (let i = start; i <= end; i += interval) {
            intervals.push(i);
        }
        return intervals;
    }

    public static getTimeSlots(interval: number): string[] {
        const intervalInHours = interval / 60;
        const slots = [];
        for (let i = 0; i < 24; i += intervalInHours) {
            let time = Math.floor(i) < 10 ? '0' + Math.floor(i) : Math.floor(i);
            time += ':' + ((i % 1) * 60 < 10 ? '0' + (i % 1) * 60 : (i % 1) * 60);
            slots.push(TimeUtilityService.convertTimeTo12Hours(time));
        }
        return slots;
    }

    public static convertTimeTo12Hours(time: string | number): string {
        const timeString12hr = new Date('1970-01-01T' + time + 'Z').toLocaleTimeString('en-US', {
            timeZone: 'UTC',
            hour12: true,
            hour: 'numeric',
            minute: 'numeric'
        });
        return timeString12hr;
    }

    public static convertTime(time: string): string {
        if (time === '' || time === undefined || time === null) {
            return '00:00:00';
        }
        const d = TimeUtilityService.getTimeInSeconds(time);
        const h = Math.floor(d / 3600) < 10 ? '0' + Math.floor(d / 3600) : Math.floor(d / 3600);
        const m = Math.floor(d % 3600 / 60) < 10 ? '0' + Math.floor(d % 3600 / 60) : Math.floor(d % 3600 / 60);
        const s = Math.floor(d % 3600 % 60) < 10 ? '0' + Math.floor(d % 3600 % 60) : Math.floor(d % 3600 % 60);
        return h + ':' + m + ':' + s;
    }

    public static getTimeInSeconds(time: string): number {
        const pm = time.split(' ')[1].toLowerCase() === 'pm' ? true : false;
        let timeInSeconds = 0;
        if (!pm) {
            const hours = Number(time.split(' ')[0].split(':')[0]) % 12;
            const minutes = Number(time.split(' ')[0].split(':')[1]);
            timeInSeconds += hours * 3600 + minutes * 60;
        } else {
            const hours = (Number(time.split(' ')[0].split(':')[0]) % 12) + 12;
            const minutes = Number(time.split(' ')[0].split(':')[1]);
            timeInSeconds += hours * 3600 + minutes * 60;
        }
        return timeInSeconds;
    }

}

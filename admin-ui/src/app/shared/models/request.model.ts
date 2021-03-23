import {API_VERSION} from 'src/app/app.constants';
import {TimeUtilityService} from '../utilities/time-utility.service';


export class RequestModel {
    version = API_VERSION;
    requesttime = TimeUtilityService.getCurrentDate();

    constructor(
        public id: string,
        public metadata: null,
        public request: any,
    ) {
    }

}

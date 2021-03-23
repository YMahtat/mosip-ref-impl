import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DEFAULT_PAGE_SIZE, MOSIP_ENDPOINT_URI} from '../../app.constants';
import {MachineDto} from '../models/machine-dto.model';

@Injectable({
    providedIn: 'root'
})
export class MachineClientService {

    constructor(
        private httpClient: HttpClient
    ) {
    }

    getMachines(primaryLanguageCode: string, pageNumber: number, machineId?: string): Observable<any> {
        let filters: any = [];
        if (machineId) {
            filters = [{columnName: 'id', type: 'equals', value: machineId}];
        }
        return this.httpClient.post(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.machinesSearchService}`,
            {
                id: null,
                metadata: null,
                request: {
                    languageCode: primaryLanguageCode,
                    filters,
                    pagination: {
                        pageFetch: DEFAULT_PAGE_SIZE,
                        pageStart: pageNumber
                    },
                    sort: []
                },
                requesttime: new Date().toISOString(),
                version: '1.0',
            }
        );
    }

    createMachine(machineToCreate: MachineDto): Observable<any> {
        const request = {
            id: null,
            metadata: null,
            request: machineToCreate,
        };
        return this.httpClient.post(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.machineServices}`,
            request
        );
    }

    updateMachine(machineToUpdate: MachineDto): Observable<any> {
        const request = {
            id: null,
            metadata: null,
            request: machineToUpdate,
        };
        return this.httpClient.put(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.machineServices}`,
            request
        );
    }

}

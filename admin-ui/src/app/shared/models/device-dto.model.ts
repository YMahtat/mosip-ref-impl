export class DeviceDto {
    constructor(
        public zoneCode: string,
        public validityDateTime: string | null,
        public name: string,
        public macAddress: string,
        public serialNum: string,
        public ipAddress: string,
        public langCode: string,
        public deviceSpecId: string,
        public id?: string,
        public isActive?: boolean
    ) {
    }
}

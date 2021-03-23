export class MachineDto {
    constructor(
        public zoneCode: string,
        public validityDateTime: string | null,
        public name: string,
        public machineSpecId: string,
        public macAddress: string,
        public serialNum: string,
        public ipAddress: string,
        public publicKey: string,
        public langCode: string,
        public id?: string,
        public isActive?: boolean,
    ) {
    }
}

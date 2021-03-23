export class MispDto {
    constructor(
        public organizationName: string | null,
        public emailId: string,
        public contactNumber: string,
        public address: string,
        public mispId?: string,
        public name?: string,
    ) {
    }
}

export class AuthPartnerDto {
    constructor(
        public partnerId: string,
        public partnerType: string | null,
        public policyGroup: string | null,
        public organizationName: string | null,
        public emailId: string | null,
        public contactNumber: string,
        public address: string
    ) {
    }
}

export class UserDetailsDto {

    constructor(
        private username: string | null,
        private email: string | null,
        private roles: string | null,
        private zone: string | null,
        private jwtToken: string | null
    ) {
    }

    setUsername(username: string): void {
        this.username = username;
    }

    getUsername(): string | null {
        return this.username;
    }

    setEmail(email: string): void {
        this.email = email;
    }

    getEmail(): string | null {
        return this.email;
    }

    setRoles(roles: string): void {
        this.roles = roles;
    }

    getRolesAsString(): string | null {
        if (this.roles) {
            const rolesCollection = this.roles.split(',');
            rolesCollection.splice(rolesCollection.length - 1, 1);
            return rolesCollection.join(', ').replace(/_/g, ' ');
        } else {
            return null;
        }
    }

    getRoles(): Array<string> | null {
        if (this.roles) {
            const rolesCollection = this.roles.split(',');
            rolesCollection.splice(rolesCollection.length - 1, 1);
            return rolesCollection;
        } else {
            return null;
        }
    }

    getRoleCodes(): string | null {
        return this.roles;
    }

    setZone(zone: string): void {
        this.zone = zone;
    }

    getZone(): string | null {
        return this.zone;
    }

    setJwtToken(jwtToken: string): void {
        this.jwtToken = jwtToken;
    }

    getJwtToken(): string | null {
        return this.jwtToken;
    }

}

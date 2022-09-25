import { UserT } from "../../Persistence/Models/User.model";

export interface UserCreate {
    email: UserT["email"];
    password: UserT["password"];
    name: UserT["name"];
}

export class UserCreateDTO {
    email?: UserT["email"];
    password?: UserT["password"];
    name?: UserT["name"];
    constructor(userData: UserCreate) {
        this.email = userData.email;
        this.password = userData.password;
        this.name = userData.name
    }
}
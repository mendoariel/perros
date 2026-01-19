export interface UserInterface {
    id?: number;
    username?: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    avatar?: string;
    bio?: string;
    address?: string;
    city?: string;
    country?: string;
    userStatus?: string;
    createdAt?: Date;
    updatedAt?: Date;
    _count?: {
        medals: number;
    };
}
export interface Pet {
    id?: string;
    name: string;
    breed: string;
    age: number;
    owner: string;
    createdAt?: Date;
    updatedAt?: Date;
} 
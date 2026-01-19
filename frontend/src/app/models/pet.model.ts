export interface Callejero {
    enabled: boolean;
}

export interface Pet {
    petName: string;
    image: string | null;
    status: string;
    description: string;
    medalString: string;
    background?: string;
    link?: string;
    phone?: string;
    animalType?: 'DOG' | 'CAT' | 'OTHER';
    breed?: string;
    size?: string;
    animalTypeOther?: string;
    callejero?: Callejero;
} 
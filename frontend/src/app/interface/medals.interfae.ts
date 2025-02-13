export interface MedalRegisterInterface {
    medalRegister: String;
    medalString: String;
    ownerEmail: string;
    password: String;
    petName: string;
}

export interface ConfirmAccountInterface {
    email: string;
    registerHash: string;
    medalHash: string;
}
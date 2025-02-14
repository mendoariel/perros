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
export interface MedalInterface {
    medalString: string;
    petName: string;
    status: string;
}
export interface RegisteredMedalInterface {
    email: string;
    message: string;
    medals: MedalInterface[];
}
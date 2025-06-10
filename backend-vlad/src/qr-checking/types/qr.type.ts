import { MedalState } from '@prisma/client';

export type MedalStatus = {
    status: MedalState;
    medalString: string;
    registerHash: string;
}
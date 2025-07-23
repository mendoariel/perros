export interface VirginMedal {
  id: number;
  status: MedalState;
  medalString: string;
  registerHash: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MedalStats {
  total: number;
  virgin: number;
  enabled: number;
  disabled: number;
  dead: number;
  registerProcess: number;
  pendingConfirmation: number;
  incomplete: number;
  registered: number;
}

export type MedalState = 
  | 'VIRGIN'
  | 'ENABLED'
  | 'DISABLED'
  | 'DEAD'
  | 'REGISTER_PROCESS'
  | 'PENDING_CONFIRMATION'
  | 'INCOMPLETE'
  | 'REGISTERED';

export interface CreateMedalsRequest {
  quantity: number;
  registerHash: string;
}

export interface QRCodeData {
  medalString: string;
  qrUrl: string;
  registerHash: string;
} 
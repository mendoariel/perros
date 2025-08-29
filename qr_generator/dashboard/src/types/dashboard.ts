// Tipos genéricos para el dashboard
export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
}

export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  description: string;
  color: string;
}

// Tipos específicos para medallas
export interface Medal {
  id: number;
  status: MedalState;
  medalString: string;
  registerHash: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MedalStats extends DashboardStats {
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

// Tipos específicos para partners
export interface Partner {
  id: number;
  name: string;
  address: string;
  whatsapp?: string;
  phone?: string;
  description?: string;
  website?: string;
<<<<<<< HEAD
  partnerType: PartnerType;
  status: PartnerStatus;
=======
  instagram?: string;
  facebook?: string;
  partnerType: PartnerType;
  status: PartnerStatus;
  profileImage?: string;
  coverImage?: string;
  gallery?: PartnerImage[];
>>>>>>> gary
  createdAt: string;
  updatedAt?: string;
  _count?: {
    articles: number;
    services: number;
    offers: number;
    comments: number;
  };
}

export interface PartnerStats extends DashboardStats {
  restaurants: number;
  veterinarians: number;
  petShops: number;
<<<<<<< HEAD
  others: number;
}

export type PartnerType = 'RESTAURANT' | 'VETERINARIAN' | 'PET_SHOP' | 'OTHER';
=======
  petFriendly: number;
  others: number;
}

export type PartnerType = 'RESTAURANT' | 'VETERINARIAN' | 'PET_SHOP' | 'PET_FRIENDLY' | 'OTHER';
>>>>>>> gary
export type PartnerStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface CreatePartnerRequest {
  name: string;
  address: string;
  whatsapp?: string;
  phone?: string;
  description?: string;
  website?: string;
<<<<<<< HEAD
  partnerType: PartnerType;
=======
  instagram?: string;
  facebook?: string;
  partnerType: PartnerType;
  profileImage?: string;
  coverImage?: string;
}

export interface PartnerImage {
  id: number;
  imageUrl: string;
  altText?: string;
  order: number;
  partnerId: number;
  createdAt: string;
  updatedAt: string;
>>>>>>> gary
}

export interface UpdatePartnerRequest {
  name?: string;
  address?: string;
  whatsapp?: string;
  phone?: string;
  description?: string;
  website?: string;
<<<<<<< HEAD
  partnerType?: PartnerType;
  status?: PartnerStatus;
=======
  instagram?: string;
  facebook?: string;
  partnerType?: PartnerType;
  status?: PartnerStatus;
  profileImage?: string;
  coverImage?: string;
>>>>>>> gary
} 
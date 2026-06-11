export type UserRole = 'ADMIN' | 'OPERATOR_REGISTRATION' | 'OPERATOR_INVENTORY' | 'VIEWER';

export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';

export type ItemStatus = 'AVAILABLE' | 'ISSUED' | 'DAMAGED' | 'LOST' | 'UNDER_MAINTENANCE';

export type ItemCondition = 'NEW' | 'GOOD' | 'USED' | 'DAMAGED';

export type FineStatus = 'PENDING' | 'PAID' | 'WAIVED';

export type ReturnCondition = 'GOOD' | 'DAMAGED' | 'LOST';

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'FULL_DAY';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface ScoutDTO {
  id: string;
  registrationNumber: string;
  fullName: string;
  fatherName: string;
  cnicOrBForm: string;
  contactNumber: string;
  emergencyContact: string;
  city: string;
  area: string;
  unitName: string;
  age: number;
  bloodGroup: BloodGroup;
  hasPreviousExperience: boolean;
  photoPath: string | null;
  registeredAt: string;
  registeredBy: string;
}

export interface InventoryItemDTO {
  id: string;
  tagNumber: string;
  name: string;
  categoryId: string;
  categoryName: string;
  status: ItemStatus;
  condition: ItemCondition;
  originalPrice: number;
  cabinShelfId: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
}

export interface IssuedItemDTO {
  id: string;
  scoutId: string;
  inventoryItemId: string;
  tagNumber: string;
  itemName: string;
  issuedAt: string;
  issuedBy: string;
  returnedAt: string | null;
  returnCondition: ReturnCondition | null;
  fineId: string | null;
}

export interface FineDTO {
  id: string;
  scoutId: string;
  scoutName: string;
  issuedItemId: string;
  tagNumber: string;
  itemName: string;
  originalPrice: number;
  finePercentage: number;
  fineAmount: number;
  status: FineStatus;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface DutyAssignmentDTO {
  id: string;
  scoutId: string;
  scoutName: string;
  registrationNumber: string;
  departmentId: string;
  departmentName: string;
  gateName: string;
  shift: ShiftType;
  reportingTime: string;
  inchargeName: string;
  assignedAt: string;
  assignedBy: string;
}

export interface GuarantorDTO {
  id: string;
  fullName: string;
  contactNumber: string;
  cnicNumber: string;
  depositedItemDescription: string;
  issuedItemBatchId: string;
  releasedAt: string | null;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  jti: string;
}

export interface AuthTokens {
  accessToken: string;
}

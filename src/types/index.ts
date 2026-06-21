export type MemberCategory = 'hypertension' | 'diabetes' | 'lipid' | 'other';

export type MemberLevel = 'normal' | 'silver' | 'gold';

export type PrescriptionStatus = 'valid' | 'expiring' | 'expired';

export type FollowUpMethod = 'phone' | 'sms' | 'visit';

export type FollowUpResult = 'connected' | 'no_answer' | 'not_needed' | 'purchased';

export interface Member {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  memberLevel: MemberLevel;
  avatar: string;
  category: MemberCategory;
  lastPurchaseDate: string;
  lastBoxes: number;
  daysSupply: number;
  remainingDays: number;
  prescriptionStatus: PrescriptionStatus;
  lastFollowResult: string;
  lastFollowDate: string;
  nextFollowDate: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  drugName: string;
  followedToday?: boolean;
  assignedTo?: string;
}

export interface PurchaseRecord {
  id: string;
  memberId: string;
  drugName: string;
  boxes: number;
  price: number;
  purchaseDate: string;
  category: string;
  pharmacist: string;
}

export interface Prescription {
  id: string;
  memberId: string;
  doctorName: string;
  issueDate: string;
  expireDate: string;
  imageUrl: string;
  notes: string;
  status: PrescriptionStatus;
  hospital: string;
}

export interface FollowUpRecord {
  id: string;
  memberId: string;
  followDate: string;
  method: FollowUpMethod;
  result: FollowUpResult;
  notes: string;
  operator: string;
  nextFollowDate: string;
}

export interface ScriptTemplate {
  type: FollowUpMethod;
  category: MemberCategory | 'all';
  title: string;
  content: string;
}

export interface CategoryStat {
  name: string;
  key: MemberCategory | 'all';
  count: number;
  completed: number;
  rate: number;
}

export interface StaffRanking {
  name: string;
  avatar: string;
  count: number;
  completed: number;
  rate: number;
}

export interface StatsFilter {
  staff: string | 'all';
  category: MemberCategory | 'all';
  prescriptionStatus: PrescriptionStatus | 'all';
  operator?: string | 'all';
  followUpResult?: FollowUpResult | 'all';
}

export interface Statistics {
  todayTotal: number;
  todayCompleted: number;
  todayRate: number;
  weekTotal: number;
  weekCompleted: number;
  weekRate: number;
  monthTotal: number;
  monthCompleted: number;
  monthRate: number;
  categoryStats: CategoryStat[];
  staffRanking: StaffRanking[];
}

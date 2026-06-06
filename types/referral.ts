export type ReferralStatus = 'new' | 'in_progress' | 'completed' | 'archived';

export interface Provider {
  id: string;
  name: string;
  practice: string;
  specialty?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
}

export interface Referral {
  id: string;
  patient: Patient;
  referralFrom: Provider;
  referredTo: Provider;
  treatment: string;
  status: ReferralStatus;
  receivedAt: string;
  notes?: string;
}

export interface ReferralStats {
  new: number;
  inProgress: number;
  completed: number;
  archived: number;
}

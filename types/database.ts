export type ReferralStatus = 'new' | 'in_progress' | 'completed' | 'archived';
export type ReferralPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ProviderRole = 'provider' | 'admin';
export type DocumentType = 'referral_letter' | 'treatment_outcome' | 'signed_form' | 'x_ray' | 'other';

export interface Database {
  public: {
    Tables: {
      practices: {
        Row: Practice;
        Insert: Omit<Practice, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Practice, 'id' | 'created_at' | 'updated_at'>>;
      };
      providers: {
        Row: Provider;
        Insert: Omit<Provider, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Provider, 'id' | 'created_at' | 'updated_at'>>;
      };
      patients: {
        Row: Patient;
        Insert: Omit<Patient, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>;
      };
      referrals: {
        Row: Referral;
        Insert: Omit<Referral, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Referral, 'id' | 'created_at' | 'updated_at'>>;
      };
      referral_messages: {
        Row: ReferralMessage;
        Insert: Omit<ReferralMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ReferralMessage, 'id' | 'created_at'>>;
      };
      referral_documents: {
        Row: ReferralDocument;
        Insert: Omit<ReferralDocument, 'id' | 'created_at'>;
        Update: Partial<Omit<ReferralDocument, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface Practice {
  id: string;
  clerk_org_id: string | null;
  name: string;
  specialty: string | null;
  npi: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  clerk_user_id: string;
  practice_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialty: string | null;
  npi: string | null;
  license_number: string | null;
  role: ProviderRole;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  practice_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  insurance_provider: string | null;
  insurance_member_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  patient_id: string;
  referring_practice_id: string;
  referring_provider_id: string;
  receiving_practice_id: string;
  receiving_provider_id: string | null;
  treatment: string;
  status: ReferralStatus;
  priority: ReferralPriority;
  notes: string | null;
  appointment_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralMessage {
  id: string;
  referral_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ReferralDocument {
  id: string;
  referral_id: string;
  uploaded_by: string;
  name: string;
  type: DocumentType;
  storage_path: string;
  file_size: number | null;
  mime_type: string | null;
  signed_at: string | null;
  signed_by: string | null;
  created_at: string;
}

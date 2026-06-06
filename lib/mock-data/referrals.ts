import type { Referral, ReferralStats } from '@/types/referral';

export const mockReferrals: Referral[] = [
  {
    id: '1',
    patient: { id: 'p1', firstName: 'James', lastName: 'Smith', dob: '12/8 OD-12795' },
    referralFrom: { id: 'pr1', name: 'Dr. Ashley Brown', practice: 'Bright Smiles Dental' },
    referredTo: { id: 'pr2', name: 'Dr. Frank Service', practice: 'Austin Oral Surgery' },
    treatment: 'Extraction #17',
    status: 'new',
    receivedAt: 'May 30, 2025',
  },
  {
    id: '2',
    patient: { id: 'p2', firstName: 'Lisa', lastName: 'Wong', dob: '11/12 OD-11892' },
    referralFrom: { id: 'pr1', name: 'Dr. Ashley Brown', practice: 'Bright Smiles Dental' },
    referredTo: { id: 'pr3', name: 'Dr. Sarah Chen', practice: 'Sadie Orthodontics' },
    treatment: 'Orthodontic Evaluation',
    status: 'in_progress',
    receivedAt: 'May 29, 2025',
  },
  {
    id: '3',
    patient: { id: 'p3', firstName: 'Michael', lastName: 'Harris', dob: '09/4 OD-10231' },
    referralFrom: { id: 'pr1', name: 'Dr. Ashley Brown', practice: 'Bright Smiles Dental' },
    referredTo: { id: 'pr4', name: 'Dr. David Lee', practice: 'Austin Periodontics' },
    treatment: 'Periodontal Consult',
    status: 'in_progress',
    receivedAt: 'May 28, 2025',
  },
  {
    id: '4',
    patient: { id: 'p4', firstName: 'Daniel', lastName: 'White', dob: '07/19 OD-09871' },
    referralFrom: { id: 'pr1', name: 'Dr. Ashley Brown', practice: 'Bright Smiles Dental' },
    referredTo: { id: 'pr5', name: 'Dr. Emily Park', practice: 'Austin Specialists' },
    treatment: 'Root Canal #30',
    status: 'new',
    receivedAt: 'May 28, 2025',
  },
  {
    id: '5',
    patient: { id: 'p5', firstName: 'Samantha', lastName: 'Carter', dob: '03/22 OD-08443' },
    referralFrom: { id: 'pr1', name: 'Dr. Ashley Brown', practice: 'Bright Smiles Dental' },
    referredTo: { id: 'pr6', name: 'Dr. James Reed', practice: 'Invisalign Center' },
    treatment: 'Orthodontic Consult',
    status: 'completed',
    receivedAt: 'May 27, 2025',
  },
  {
    id: '6',
    patient: { id: 'p6', firstName: 'Brandon', lastName: 'Ross', dob: '01/5 OD-07832' },
    referralFrom: { id: 'pr1', name: 'Dr. Ashley Brown', practice: 'Bright Smiles Dental' },
    referredTo: { id: 'pr7', name: 'Dr. Frank Service', practice: 'Austin Periodontics' },
    treatment: 'Gum Recession',
    status: 'archived',
    receivedAt: 'May 26, 2025',
  },
];

export const mockStats: ReferralStats = {
  new: 18,
  inProgress: 24,
  completed: 36,
  archived: 8,
};

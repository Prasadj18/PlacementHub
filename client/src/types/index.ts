// ─── Enums ──────────────────────────────────────────────

export type WorkMode = 'ONSITE' | 'REMOTE' | 'HYBRID';

export type ApplicationStatus =
  | 'APPLIED'
  | 'OA'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED';

export type EventType = 'PPT' | 'OA' | 'INTERVIEW' | 'RESULT' | 'OTHER';

export type ExperienceRound =
  | 'OA'
  | 'TECHNICAL_INTERVIEW'
  | 'HR_INTERVIEW'
  | 'PPT'
  | 'OTHER';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type NotificationType =
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_REMINDER'
  | 'GENERAL';

// ─── Models ─────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  branch: string;
  graduationYear: number;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  role: string;
  ctc?: string;
  description?: string;
  eligibility?: string;
  eligibleBranches: string[];
  location?: string;
  workMode: WorkMode;
  notes?: string;
  logoUrl?: string;
  createdAt: string;
  createdBy: { id: string; name: string };
  _count?: { applications: number; events: number; experiences?: number };
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  userId: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    role: string;
    ctc?: string;
    location?: string;
    workMode: WorkMode;
    logoUrl?: string;
  };
}

export interface Event {
  id: string;
  type: EventType;
  title: string;
  dateTime: string;
  venue?: string;
  isOnline: boolean;
  meetingUrl?: string;
  description?: string;
  companyId: string;
  createdAt: string;
  company: { id: string; name: string; logoUrl?: string };
  createdBy: { id: string; name: string };
}

export interface Experience {
  id: string;
  round: ExperienceRound;
  content: string;
  difficulty: Difficulty;
  createdAt: string;
  user: { id: string; name: string; branch: string; graduationYear: number };
  company: { id: string; name: string; logoUrl?: string };
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  entityId?: string;
  entityType?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  createdAt: string;
  user: { id: string; name: string };
}

export interface CompanyDetail extends Company {
  events: Event[];
  userApplication: Application | null;
}

export interface DashboardData {
  stats: {
    totalApplied: number;
    shortlisted: number;
    interviews: number;
    selected: number;
  };
  nextEvent: Event | null;
  upcomingEvents: Event[];
  recentApplications: Application[];
}

export interface Profile extends User {
  _count: {
    applications: number;
    experiences: number;
  };
}

// ─── API Types ──────────────────────────────────────────

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  branch: string;
  graduationYear: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateCompanyInput {
  name: string;
  role: string;
  ctc?: string;
  description?: string;
  eligibility?: string;
  eligibleBranches?: string[];
  location?: string;
  workMode?: WorkMode;
  notes?: string;
  logoUrl?: string;
}

export interface CreateEventInput {
  companyId: string;
  type: EventType;
  title: string;
  dateTime: string;
  venue?: string;
  isOnline?: boolean;
  meetingUrl?: string;
  description?: string;
}

export interface CreateExperienceInput {
  companyId: string;
  round: ExperienceRound;
  content: string;
  difficulty: Difficulty;
}

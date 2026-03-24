// API Response Types
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'admin' | 'moderator' | 'support' | 'analyst';
  image?: string;
  createdAt: string;
}

// Admin User Type (for user management endpoints)
export interface AdminUser {
  id: number;
  email: string;
  phone: string | null;
  username: string | null;
  profile_picture: string | null;
  role: 'guest' | 'host' | 'admin';
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface AdminUserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  by_role: {
    guest: number;
    host: number;
    admin: number;
  };
  email_verified: number;
  phone_verified: number;
  timestamp: string;
}

export interface AdminUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Host Request Types
export interface HostUser {
  id: number;
  username: string;
  email: string;
  rating: number;
  profile_picture: string;
}

export interface HostRequest {
  id: number;
  user: HostUser;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
}

// Listing Types
export interface ListingDetail {
  house_type: string;
  rooms: number;
  bathrooms: number;
  furnished: boolean;
  amenities: string[];
  rules: string[];
  price_per_night: number;
  min_stay: number;
  contract_required: string;
  check_in_time: string;
  check_out_time: string;
  contact_phone: string;
  secondary_phone: string | null;
}

export interface Listing {
  id: string;
  owner: number;
  type: string;
  title: string;
  slug: string;
  description: string;
  wilaya: string;
  municipality: string;
  postal_code: string;
  lat: number;
  lng: number;
  status: 'active' | 'inactive' | 'pending';
  capacity: number;
  media: any[];
  availabilities: any[];
  detail: ListingDetail;
  created_at: string;
  updated_at: string;
}

// User Mini Type
export interface UserMini {
  id: string;
  username: string;
  email: string;
  rating: number;
  profile_picture?: string;
}

// Booking Types
export interface Booking {
  id: string;
  listing: Listing;
  guest: UserMini;
  host: UserMini;
  start_date: string;
  end_date: string;
  nights: string;
  price_total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  decision_at?: string;
  cancelled_at?: string;
  updated_at: string;
  is_active: boolean;
}

// Budget Post Types
export interface BudgetGuest {
  id: number;
  username: string;
  email: string;
  rating: number;
  profile_picture: string;
}

export interface BudgetPost {
  id: string;
  guest: BudgetGuest;
  winning_host: number | null;
  title: string;
  budget_min: number;
  budget_max: number;
  budget_per_night: number;
  final_agreed_price: number | null;
  currency: string;
  nights: number;
  notes: string;
  wilaya: string;
  municipality: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Support Ticket Types
export interface EventTicketType {
  id: string;
  event: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  total_quantity: number;
  available_quantity: number;
  max_per_user?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_available: boolean;
  sold_quantity: number;
}

export interface Ticket {
  id: string;
  user: number;
  ticket_type: EventTicketType;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  ticket_number: string;
  qr_code: string;
  status: 'valid' | 'used' | 'expired';
  price: number;
  created_at: string;
  used_at: string | null;
  can_be_used: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  activeListings: number;
  pendingHostRequests: number;
  monthlyBookings: number;
  totalRevenue: number;
  currency: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

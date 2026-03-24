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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Host Request Types
export interface HostRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  wilaya: string;
  birthDate: string;
  cinNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Listing Types
export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  wilaya: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  images: string[];
  hostId: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
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
export interface BudgetPost {
  id: string;
  title: string;
  budget: number;
  currency: string;
  description: string;
  category: string;
  status: 'active' | 'closed';
  authorId: string;
  responses: number;
  createdAt: string;
  updatedAt: string;
}

// Support Ticket Types
export interface TicketType {
  id: string;
  event: string;
  name: string;
  price: number;
  currency: string;
}

export interface Ticket {
  id: string;
  user: string;
  ticketType: TicketType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ticketNumber: string;
  qrCode: string;
  status: 'valid' | 'used' | 'expired';
  price: number;
  createdAt: string;
  usedAt: string | null;
  canBeUsed: boolean;
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

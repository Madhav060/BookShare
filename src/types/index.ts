// src/types/index.ts - Phase 2 Updated Types

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'DELIVERY_AGENT' | 'ADMIN';
  bio?: string;
  avatar?: string;
  location?: string;
  rating: number;
  totalBorrows: number;
  totalLends: number;
  createdAt: Date;
}

export interface UserBasic {
  id: number;
  name: string;
  email: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  status: 'AVAILABLE' | 'BORROWED';
  isVisible?: boolean;
  deletedAt?: Date | null;
  isbn?: string;
  description?: string;
  coverImage?: string;
  publishYear?: number;
  language: string;
  pageCount?: number;
  viewCount: number;
  borrowCount: number;
  ownerId?: number;
  userId?: number;
  createdAt: Date;
  owner?: UserBasic;
  holder?: UserBasic;
  categories?: BookCategory[];
  reviews?: Review[];
}

export interface Category {
  id: number;
  name: string;
}

export interface BookCategory {
  bookId: number;
  categoryId: number;
  category?: Category;
}

export interface Review {
  id: number;
  bookId: number;
  userId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
  user?: UserBasic;
}

export interface UserRating {
  id: number;
  ratedUserId: number;
  raterUserId: number;
  rating: number;
  comment?: string;
  context: 'borrower' | 'lender';
  createdAt: Date;
  rater?: UserBasic;
}

export interface BorrowRequest {
  id: number;
  bookId: number;
  borrowerId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  createdAt: Date;
  book?: Book;
  borrower?: UserBasic;
  delivery?: Delivery;
}

export interface RequestsResponse {
  incoming: BorrowRequest[];
  outgoing: BorrowRequest[];
}

export interface DeliveryAgentProfile {
  id: number;
  userId: number;
  phoneNumber: string;
  vehicleType?: string;
  licenseNumber?: string;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Delivery {
  id: number;
  borrowRequestId: number;
  agentId?: number;
  pickupAddress: string;
  deliveryAddress: string;
  status: DeliveryStatus;
  pickupScheduled?: Date;
  pickupCompleted?: Date;
  deliveryCompleted?: Date;
  trackingNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  agent?: UserBasic;
  borrowRequest?: BorrowRequest;
}

export type DeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RETURN_SCHEDULED'
  | 'RETURN_PICKED_UP'
  | 'RETURN_DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'BORROW_REQUEST'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_REJECTED'
  | 'BOOK_RETURNED'
  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_PICKED_UP'
  | 'DELIVERY_DELIVERED'
  | 'NEW_REVIEW'
  | 'SYSTEM_MESSAGE';

export interface SearchFilters {
  q?: string;
  category?: string[];
  status?: 'AVAILABLE' | 'BORROWED';
  sortBy?: 'recent' | 'popular' | 'rating';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AnalyticsData {
  totalUsers: number;
  totalBooks: number;
  activeBorrows: number;
  totalDeliveries: number;
  popularBooks: Array<{
    id: number;
    title: string;
    author: string;
    borrowCount: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
}
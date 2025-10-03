export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'DELIVERY_AGENT' | 'ADMIN';
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
  isVisible?: boolean; // Optional if not always present
  ownerId?: number;    // Optional for flexibility
  userId?: number;     // Optional for flexibility
  createdAt: Date;
  owner?: UserBasic;
  holder?: UserBasic;
}

export interface BorrowRequest {
  id: number;
  bookId: number;
  borrowerId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  createdAt: Date;
  book?: Book;
  borrower?: UserBasic;
}

export interface RequestsResponse {
  incoming: BorrowRequest[];
  outgoing: BorrowRequest[];
}
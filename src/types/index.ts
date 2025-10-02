// src/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'DELIVERY_AGENT' | 'ADMIN';
  createdAt: Date;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  status: 'AVAILABLE' | 'BORROWED';
  ownerId: number;
  userId: number;
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

export interface UserBasic {
  id: number;
  name: string;
  email: string;
}

export interface RequestsResponse {
  incoming: BorrowRequest[];
  outgoing: BorrowRequest[];
}
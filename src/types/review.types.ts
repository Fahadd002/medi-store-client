// types/review.types.ts
export enum ReviewSortBy {
  NEWEST = "createdAt",
  RATING_HIGH = 5,
  RATING_LOW = 0
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewWithReplies {
  id: string;
  rating: number | null;
  comment: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
  };
  seller?: {
    id: string;
    name: string;
    email?: string;
  };
  replies: ReviewWithReplies[];
  medicineId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
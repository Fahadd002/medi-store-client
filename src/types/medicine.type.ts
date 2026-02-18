export interface MedicineCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ReviewCustomer {
  id: string;
  name: string;
  image?: string;
}

export interface MedicineReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  customer: ReviewCustomer;
}

export interface MedicineSeller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
}

export interface Medicine {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  discountPercent?: number;
  stock: number;
  manufacturer: string;
  expiryDate?: string;
  isActive: boolean;
  photoUrl?: string;
  unit?: string;
  categoryId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  
  category?: MedicineCategory;
  seller?: MedicineSeller;
  reviews?: MedicineReview[];
  _count?: {
    reviews: number;
  };
}

export interface MedicineWithDetails extends Medicine {
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  topReviews: MedicineReview[];
  discountPrice?: number;
}
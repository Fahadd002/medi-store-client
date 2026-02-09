"use server";

import { 
  CreateReviewPayload, 
  ReplyToReviewPayload, 
  GetReviewsParams,
  reviewService 
} from "@/services/review.service";
import { updateTag } from "next/cache";

export const createReview = async (data: CreateReviewPayload) => {
  if (!data.medicineId || !data.rating) {
    return {
      data: null,
      error: { message: "Medicine ID and rating are required" }
    };
  }

  if (data.rating < 1 || data.rating > 5) {
    return {
      data: null,
      error: { message: "Rating must be between 1 and 5" }
    };
  }

  const res = await reviewService.createReview(data);
  
  if (res.data) {
    updateTag(`reviews-${data.medicineId}`);
    updateTag("my-reviews");
  }
  
  return res;
};

export const replyToReview = async (parentId: string, data: ReplyToReviewPayload) => {
  if (!data.comment || data.comment.trim().length === 0) {
    return {
      data: null,
      error: { message: "Reply comment is required" }
    };
  }

  const res = await reviewService.replyToReview(parentId, data);
  
  if (res.data) {
    updateTag("seller-reviews");
  }
  
  return res;
};

export const getReviewsByMedicine = async (
  medicineId: string,
  params?: GetReviewsParams,
  options?: {
    cache?: RequestCache;
    revalidate?: number;
  }
) => {
  if (!medicineId) {
    return {
      data: null,
      error: { message: "Medicine ID is required" }
    };
  }

  return await reviewService.getReviewsByMedicine(medicineId, params, options);
};

export const deleteReview = async (reviewId: string) => {
  if (!reviewId) {
    return {
      data: null,
      error: { message: "Review ID is required" }
    };
  }

  const res = await reviewService.deleteReview(reviewId);
  if (res.data) {
    updateTag("my-reviews");
    updateTag("seller-reviews");
  }
  
  return res;
};

export const getMyReviews = async (
  params?: GetReviewsParams,
  options?: {
    cache?: RequestCache;
    revalidate?: number;
  }
) => {
  return await reviewService.getMyReviews(params, options);
};

export const getReviewsToReply = async (
  params?: GetReviewsParams,
  options?: {
    cache?: RequestCache;
    revalidate?: number;
  }
) => {
  return await reviewService.getReviewsToReply(params, options);
};

export const getReviewStats = async (medicineId: string) => {
  if (!medicineId) {
    return {
      data: null,
      error: { message: "Medicine ID is required" }
    };
  }

  return await reviewService.getReviewStats(medicineId);
};

export const checkReviewEligibility = async (orderId: string, medicineId: string) => {
  if (!orderId || !medicineId) {
    return {
      data: null,
      error: { message: "Order ID and Medicine ID are required" }
    };
  }

  const res = await reviewService.checkReviewEligibility(orderId, medicineId);
  
  return res;
};
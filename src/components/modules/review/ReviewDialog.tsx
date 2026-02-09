// components/modules/review/ReviewDialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2, MessageSquare, HelpCircle } from "lucide-react";
import { createReview } from "@/actions/review.action";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicineId: string;
  medicineName: string;
  orderId: string;
  onSuccess?: () => void;
}

export default function ReviewDialog({
  open,
  onOpenChange,
  medicineId,
  medicineName,
  orderId,
  onSuccess
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      
      const result = await createReview({
        rating,
        comment: comment.trim(),
        medicineId,
        orderId
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Review submitted successfully!");
      

      setRating(5);
      setComment("");
      
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(5);
      setComment("");
      setShowTips(false);
      onOpenChange(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-emerald-900">
                Write a Review
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-sm">
                {medicineName}
              </DialogDescription>
            </div>
            <Badge variant="outline" className="border-emerald-200 text-emerald-700">
              Required
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-gray-900">
                How would you rate this product? *
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-900">{rating}.0</span>
                <span className="text-sm text-gray-600">/ 5</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 rounded"
                    disabled={submitting}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-500 text-amber-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {getRatingText(rating)}
                </div>
                <div className="text-xs text-gray-500">
                  {rating === 5 && "Perfect experience"}
                  {rating === 4 && "Met expectations"}
                  {rating === 3 && "Could be better"}
                  {rating === 2 && "Below expectations"}
                  {rating === 1 && "Very disappointed"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="comment" className="font-medium text-gray-900">
                Share your experience (Optional)
              </Label>
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <HelpCircle className="h-3 w-3" />
                {showTips ? "Hide tips" : "Show tips"}
              </button>
            </div>
            
            <Textarea
              id="comment"
              placeholder="What did you like or dislike? How was the quality and effectiveness?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] max-h-[150px] resize-none text-sm"
              disabled={submitting}
            />
            
            {showTips && (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-emerald-800">
                    <span className="font-medium">Tip:</span> Mention specific details about product quality, 
                    effectiveness, side effects, and value for money.
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Your review helps other customers</span>
              <span>{comment.length}/500 characters</span>
            </div>
          </div>

          <div className="border-t border-emerald-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">Quick tips for helpful reviews:</span>
              <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-800">
                Optional
              </Badge>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                <span>Was the product effective for its intended use?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                <span>How was the product quality and packaging?</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">•</span>
                <span>Would you recommend this to others?</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="order-2 sm:order-1 flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !rating}
            className="order-1 sm:order-2 flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
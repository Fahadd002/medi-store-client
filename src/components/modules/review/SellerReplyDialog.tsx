// components/modules/review/SellerReplyDialog.tsx
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
import { Loader2, MessageSquare } from "lucide-react";
import { replyToReview } from "@/actions/review.action";
import { toast } from "sonner";

interface SellerReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
  customerName: string;
  customerComment: string;
  onSuccess?: () => void;
}

export default function SellerReplyDialog({
  open,
  onOpenChange,
  reviewId,
  customerName,
  customerComment,
  onSuccess
}: SellerReplyDialogProps) {
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reply.trim()) {
      toast.error("Please write a reply");
      return;
    }

    try {
      setSubmitting(true);
      
      const result = await replyToReview(reviewId, {
        comment: reply.trim()
      });

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Reply submitted successfully!");
      
      // Reset form
      setReply("");
      
      // Close dialog
      onOpenChange(false);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Failed to submit reply:", error);
      toast.error("Failed to submit reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setReply("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-emerald-900">
            Reply to Customer Review
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Respond to {customerName}&apos; feedback
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Customer's Original Review */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{customerName}</span>
                  <span className="text-xs text-gray-500">Customer</span>
                </div>
                <p className="text-gray-700 text-sm">{customerComment}</p>
              </div>
            </div>
          </div>

          {/* Seller's Reply */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="reply" className="font-medium text-gray-900">
                Your Reply *
              </Label>
              <span className="text-xs text-gray-500">
                As the seller, your reply will be visible to all customers
              </span>
            </div>
            
            <Textarea
              id="reply"
              placeholder="Thank the customer and address their feedback professionally..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-[120px] text-sm"
              disabled={submitting}
            />
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Be professional and helpful in your response</span>
              <span>{reply.length}/500 characters</span>
            </div>
          </div>

          {/* Reply Tips */}
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-emerald-900 mb-2">Tips for a good reply:</h4>
                <ul className="space-y-1.5 text-xs text-emerald-800">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">•</span>
                    <span>Thank the customer for their feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">•</span>
                    <span>Address specific points from their review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">•</span>
                    <span>Be professional and courteous</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">•</span>
                    <span>Offer solutions or explanations if needed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !reply.trim()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Reply"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
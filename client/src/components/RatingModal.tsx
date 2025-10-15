import { useState } from "react";
import { Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  vendorId: string;
  onSuccess?: () => void;
}

export function RatingModal({ 
  open, 
  onOpenChange, 
  bookingId, 
  vendorId,
  onSuccess 
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();

  const createReviewMutation = useMutation({
    mutationFn: async (data: { bookingId: string; vendorId: string; rating: number; comment?: string }) => {
      return await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setRating(0);
      setComment("");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({
      bookingId,
      vendorId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-rating-modal">
        <DialogHeader>
          <DialogTitle>Rate Your Pickup Experience</DialogTitle>
          <DialogDescription>
            How was your experience with the pickup service?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  data-testid={`button-star-${star}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover-elevate active-elevate-2"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground" data-testid="text-rating-selected">
                {rating} star{rating !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Comment Textarea */}
          <div className="space-y-2">
            <label htmlFor="review-comment" className="text-sm font-medium">
              Your Feedback (Optional)
            </label>
            <Textarea
              id="review-comment"
              data-testid="input-review-comment"
              placeholder="Share your experience with the pickup service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            data-testid="button-submit-review"
            onClick={handleSubmit}
            disabled={createReviewMutation.isPending || rating === 0}
            className="w-full"
          >
            {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

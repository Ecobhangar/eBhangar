import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string | null;
    phoneNumber: string;
  };
}

interface VendorReviewsResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

interface VendorReviewsProps {
  vendorId: string;
}

export function VendorReviews({ vendorId }: VendorReviewsProps) {
  const { data, isLoading } = useQuery<VendorReviewsResponse>({
    queryKey: ["/api/reviews/vendor", vendorId],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  const reviews = data?.reviews || [];
  const averageRating = data?.averageRating || 0;
  const totalReviews = data?.totalReviews || 0;

  return (
    <div className="space-y-6">
      {/* Average Rating Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold" data-testid="text-average-rating">
                {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="border-l pl-4">
              <p className="text-2xl font-semibold" data-testid="text-total-reviews">
                {totalReviews}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalReviews === 1 ? "Review" : "Reviews"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Feedback</h3>
          {reviews.slice(0, 10).map((review) => (
            <Card key={review.id} data-testid={`card-review-${review.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.customer.name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" data-testid={`text-customer-name-${review.id}`}>
                          {review.customer.name || "Customer"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1" data-testid={`rating-stars-${review.id}`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <div className="flex items-start gap-2 mt-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground" data-testid={`text-comment-${review.id}`}>
                          {review.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete pickups to receive customer feedback
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

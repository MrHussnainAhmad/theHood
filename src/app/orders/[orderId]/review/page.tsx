"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Star, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default function ReviewPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.orderId;
  
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to submit review");
        return;
      }

      toast.success("Thank you for your review!");
      router.push(`/orders/${orderId}`);
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return { emoji: "😞", label: "Poor", color: "text-red-600" };
      case 2: return { emoji: "😕", label: "Fair", color: "text-orange-600" };
      case 3: return { emoji: "😐", label: "Good", color: "text-yellow-600" };
      case 4: return { emoji: "😊", label: "Very Good", color: "text-lime-600" };
      case 5: return { emoji: "🤩", label: "Excellent", color: "text-green-600" };
      default: return null;
    }
  };

  const currentRating = getRatingLabel(hoveredRating || rating);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Order
        </Link>

        <div className="bg-white rounded-3xl shadow-premium-lg p-8 sm:p-10 border border-neutral-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-50 to-accent-50 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">We Value Your Feedback</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-3">
              Rate Your Experience
            </h1>
            <p className="text-neutral-600 text-lg">
              Help us improve our services
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-10">
              <label className="block text-center text-base font-semibold text-neutral-700 mb-6">
                How would you rate this service?
              </label>
              <div className="flex justify-center gap-3 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-all duration-200 hover:scale-125 active:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-14 h-14 sm:w-16 sm:h-16 transition-all ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-yellow-400 drop-shadow-lg"
                          : "text-neutral-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              {currentRating && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-neutral-50 to-neutral-100 px-6 py-3 rounded-full">
                    <span className="text-3xl">{currentRating.emoji}</span>
                    <span className={`text-xl font-bold ${currentRating.color}`}>
                      {currentRating.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Comment */}
            <div className="mb-8">
              <label className="block text-base font-semibold text-neutral-700 mb-3">
                Share Your Thoughts (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border-2 border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all resize-none"
                placeholder="Tell us about your experience with our service..."
                rows={5}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-neutral-500">
                  Help others make informed decisions
                </p>
                <p className="text-sm text-neutral-400">
                  {comment.length}/500
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-4 text-lg font-semibold"
              disabled={rating === 0}
              isLoading={isLoading}
            >
              <Star className="w-5 h-5" />
              Submit Review
            </Button>
          </form>

          {/* Privacy Note */}
          <p className="text-center text-xs text-neutral-500 mt-6">
            Your review will be publicly visible and help us maintain service quality
          </p>
        </div>
      </div>
    </div>
  );
}
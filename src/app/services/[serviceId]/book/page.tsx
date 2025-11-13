"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import PaymentWrapper from "@/components/payment/PaymentWrapper";
import {
  MapPin,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string | null;
}

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

export default function BookServicePage({ params }: PageProps) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const serviceId = unwrappedParams.serviceId;

  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [locationAvailable, setLocationAvailable] = useState<boolean | null>(
    null
  );
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [orderAmount, setOrderAmount] = useState(100);
  const [createdOrderId, setCreatedOrderId] = useState("");

  const [formData, setFormData] = useState({
    address: "",
    city: "",
    area: "",
    pincode: "",
    description: "",
    scheduledDate: "",
  });

  const [images, setImages] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch service details
  useEffect(() => {
    async function fetchService() {
      try {
        const response = await fetch(`/api/services/${serviceId}`);
        if (response.ok) {
          const data = await response.json();
          setService(data);
        }
      } catch (error) {
        toast.error("Failed to load service");
      }
    }
    fetchService();
  }, [serviceId]);

  const checkLocationAvailability = async () => {
    if (!formData.city) {
      toast.error("Please enter your city");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/locations/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: formData.city,
          area: formData.area,
          pincode: formData.pincode,
        }),
      });

      const data = await response.json();
      setLocationAvailable(data.available);

      if (data.available) {
        toast.success("Great! We serve your area");
        setStep(2);
      } else {
        toast.error("Sorry, service not available in your area yet");
      }
    } catch (error) {
      toast.error("Failed to check availability");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Convert to base64 (in production, upload to cloud storage)
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async () => {
    if (!formData.description) {
      toast.error("Please provide service description");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: serviceId,
          address: formData.address,
          city: formData.city,
          area: formData.area,
          pincode: formData.pincode,
          description: formData.description,
          scheduledDate: formData.scheduledDate || null,
          images,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const order = await response.json();
      setCreatedOrderId(order.id);

      // Create payment intent
      const paymentResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: orderAmount,
          orderId: order.id,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || "Failed to create payment");
      }

      setClientSecret(paymentData.clientSecret);
      setShowPayment(true);
      toast.success("Order created! Please complete payment.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    toast.success("Order placed and paid successfully!");
    router.push("/dashboard");
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    toast.info("Payment cancelled. You can pay later from your dashboard.");
    router.push("/dashboard");
  };

  if (status === "loading" || !service) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
            Book {service.name}
          </h1>
          <p className="text-neutral-600">{service.description}</p>
          {service.price && (
            <p className="text-lg font-semibold text-primary-600 mt-2">
              {service.price}
            </p>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Location" },
              { num: 2, label: "Details" },
              { num: 3, label: "Confirm" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= s.num
                        ? "bg-primary-600 text-white"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {step > s.num ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={`text-sm mt-2 font-medium ${
                      step >= s.num ? "text-primary-600" : "text-neutral-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      step > s.num ? "bg-primary-600" : "bg-neutral-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Location Check */}
        {step === 1 && (
          <div className="card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold text-neutral-900">
                  Service Location
                </h2>
                <p className="text-sm text-neutral-600">
                  Check if we serve your area
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="input-field"
                  placeholder="123 Main Street, Apartment 4B"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="input-field"
                    placeholder="New York"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Area/District
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    className="input-field"
                    placeholder="Manhattan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Pincode/ZIP
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  className="input-field"
                  placeholder="10001"
                />
              </div>

              {locationAvailable === false && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">
                      Sorry, not available. Check soon!
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      We're expanding our services. We'll notify you when we're
                      available in your area.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={checkLocationAvailability}
                isLoading={isLoading}
                disabled={!formData.city || !formData.address}
              >
                Check Availability
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Service Details */}
        {step === 2 && (
          <div className="card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold text-neutral-900">
                  Service Details
                </h2>
                <p className="text-sm text-neutral-600">
                  Tell us about your requirements
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input-field min-h-[120px]"
                  placeholder="Please describe what you need help with in detail..."
                  required
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Be as specific as possible to help us serve you better
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Preferred Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  className="input-field"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Upload Images (Optional, Max 5)
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={images.length >= 5}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-10 h-10 text-neutral-400 mb-2" />
                    <span className="text-sm font-medium text-neutral-700">
                      {images.length >= 5
                        ? "Maximum images uploaded"
                        : "Click to upload images"}
                    </span>
                    <span className="text-xs text-neutral-500 mt-1">
                      PNG, JPG up to 5MB each ({images.length}/5)
                    </span>
                  </label>
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Estimated Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="number"
                    value={orderAmount}
                    onChange={(e) =>
                      setOrderAmount(parseFloat(e.target.value) || 0)
                    }
                    className="input-field pl-12"
                    placeholder="100"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  This is an estimated amount. Final price may vary based on
                  actual work required.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-5 h-5" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!formData.description || orderAmount <= 0}
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold text-neutral-900">
                  Confirm Booking
                </h2>
                <p className="text-sm text-neutral-600">
                  Review your order details
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Service Info */}
              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Service
                </h3>
                <p className="text-neutral-700">{service.name}</p>
                {service.price && (
                  <p className="text-primary-600 font-medium mt-1">
                    {service.price}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Location
                </h3>
                <p className="text-neutral-700">{formData.address}</p>
                <p className="text-neutral-600 text-sm">
                  {formData.city}
                  {formData.area && `, ${formData.area}`}
                  {formData.pincode && ` - ${formData.pincode}`}
                </p>
              </div>

              {/* Description */}
              <div className="bg-neutral-50 rounded-lg p-4">
                <h3 className="font-semibold text-neutral-900 mb-2">
                  Description
                </h3>
                <p className="text-neutral-700">{formData.description}</p>
              </div>

              {/* Scheduled Date */}
              {formData.scheduledDate && (
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    Scheduled For
                  </h3>
                  <p className="text-neutral-700">
                    {new Date(formData.scheduledDate).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Images */}
              {images.length > 0 && (
                <div className="bg-neutral-50 rounded-lg p-4">
                  <h3 className="font-semibold text-neutral-900 mb-2">
                    Uploaded Images ({images.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 border-2 border-primary-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900">
                    Total Amount
                  </h3>
                  <p className="text-3xl font-bold text-primary-600">
                    ${orderAmount.toFixed(2)}
                  </p>
                </div>
                <p className="text-xs text-neutral-600 mt-2">
                  You'll be redirected to secure payment after confirming
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-5 h-5" />
                Back
              </Button>
              <Button onClick={handleCreateOrder} isLoading={isLoading}>
                <CheckCircle className="w-5 h-5" />
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && clientSecret && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                Complete Payment
              </h2>
              <p className="text-neutral-600 text-sm">
                Secure payment powered by Stripe
              </p>
            </div>

            <PaymentWrapper
              amount={orderAmount}
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
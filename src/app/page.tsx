import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sparkles, Shield, Clock, ArrowRight, Home as HomeIcon } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import ReviewsSection from "@/components/home/ReviewsSection";

export default async function HomePage() {
  // Check if user is logged in
  const session = await getServerSession(authOptions);

  // Redirect authenticated users to their respective dashboards
  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  // Only show homepage to non-authenticated users
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-accent-600" />
              <span className="text-sm font-medium text-neutral-700">Premium Home Services</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-neutral-900 mb-6 animate-slide-up">
              Your Home Deserves{" "}
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Premium Care
              </span>
            </h1>
            
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto animate-slide-up">
              Professional cleaning, painting, repairs, plumbing, and pest control services delivered with excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link href="/services">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Services
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -z-10 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 -z-10 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-96 h-96 bg-accent-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-4">
              Why Choose Hood?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We bring professional-grade services right to your doorstep
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Premium Quality</h3>
              <p className="text-neutral-600">
                Certified professionals with years of experience
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">On-Time Service</h3>
              <p className="text-neutral-600">
                Punctual and reliable service delivery
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Guaranteed</h3>
              <p className="text-neutral-600">
                100% satisfaction or your money back
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Professional solutions for every home maintenance need
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: "✨", name: "Cleaning", color: "from-blue-500 to-cyan-500" },
              { icon: "🎨", name: "Painting", color: "from-purple-500 to-pink-500" },
              { icon: "🔧", name: "Repairs", color: "from-orange-500 to-red-500" },
              { icon: "💧", name: "Plumbing", color: "from-teal-500 to-green-500" },
              { icon: "🐛", name: "Pest Control", color: "from-yellow-500 to-orange-500" },
              { icon: "🏠", name: "Maintenance", color: "from-indigo-500 to-purple-500" },
            ].map((service, idx) => (
              <div
                key={idx}
                className="card-hover text-center p-6"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="font-semibold text-neutral-900">{service.name}</h3>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button size="lg">
                View All Services
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Hood for their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-white/90 border-0 w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" className="bg-white/20 text-white hover:bg-white/30 border-2 border-white w-full sm:w-auto backdrop-blur-sm">
                Browse Services
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-white mb-1">500+</div>
              <div className="text-white/80 text-sm">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-1">1000+</div>
              <div className="text-white/80 text-sm">Services Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-1">4.9</div>
              <div className="text-white/80 text-sm">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                  <HomeIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold">Hood</span>
              </div>
              <p className="text-neutral-400 mb-4 max-w-md">
                Professional home maintenance services delivered with excellence. Your trusted partner for all home service needs.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/services" className="text-neutral-400 hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/login" className="text-neutral-400 hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="text-neutral-400 hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-800 text-center text-neutral-400">
            <p>© 2024 Hood. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
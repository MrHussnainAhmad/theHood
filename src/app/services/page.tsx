import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import { Sparkles, Paintbrush, Wrench, Droplet, Bug, Home } from "lucide-react";
import Link from "next/link";

async function getServices() {
  return await prisma.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

const iconMap: Record<string, any> = {
  sparkles: Sparkles,
  palette: Paintbrush,
  wrench: Wrench,
  droplet: Droplet,
  bug: Bug,
  home: Home,
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-neutral-900 mb-4">
            Our Premium Services
          </h1>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Professional home maintenance solutions tailored to your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const Icon = iconMap[service.icon || "home"] || Home;
            
            return (
              <Link
                key={service.id}
                href={`/services/${service.id}/book`}
                className="group"
              >
                <div className="card-hover h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    {service.price && (
                      <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                        {service.price}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-display font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-neutral-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                    Book Now
                    <span className="inline-block group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No services available
            </h3>
            <p className="text-neutral-600">
              Please check back later for available services
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
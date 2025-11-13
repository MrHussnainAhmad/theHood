"use client";

import { useEffect, useState } from "react";
import { Shield, Smartphone } from "lucide-react";

export default function AdminMobileBlock() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running in Capacitor (mobile app)
    const checkPlatform = async () => {
      if (typeof window !== "undefined") {
        // Simple check for mobile browser
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileDevice =
          /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
            userAgent
          );

        // Check if Capacitor is available
        try {
          const { Capacitor } = await import("@capacitor/core");
          const isNative = Capacitor.isNativePlatform();
          setIsMobile(isNative || isMobileDevice);
        } catch {
          setIsMobile(isMobileDevice);
        }
      }
    };

    checkPlatform();
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-3">
          Access Restricted
        </h1>

        <div className="mb-6">
          <Smartphone className="w-16 h-16 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-700 mb-2">
            The Admin Panel is only accessible from desktop browsers.
          </p>
          <p className="text-sm text-neutral-600">
            Please use a computer to access administrative features.
          </p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-600">
            For security and usability reasons, admin functions require a
            larger screen and are not available on mobile devices.
          </p>
        </div>

        <a
          href="/"
          className="inline-block w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}
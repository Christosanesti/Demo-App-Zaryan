"use client";
import React, { useRef } from "react";
import gsap from "gsap";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

export default function Page() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Only animate background blobs, not the main content
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Background blob animations only
    tl.from(".bg-blob", {
      scale: 0,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
    });

    // Continuous floating animation for one blob
    gsap.to(".floating-blob", {
      y: "30px",
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
    >
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bg-blob absolute -top-40 -right-40 w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-blue-600/20 via-slate-600/20 to-slate-700/20 rounded-full blur-3xl" />
        <div className="bg-blob floating-blob absolute -bottom-40 -left-40 w-80 h-80 md:w-96 md:h-96 bg-gradient-to-tr from-slate-600/20 via-slate-700/20 to-blue-600/20 rounded-full blur-3xl" />
        <div className="bg-blob absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-br from-slate-700/20 via-slate-800/20 to-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col items-center justify-center py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12 opacity-100">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent">
              Zaryan
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-[90%] sm:max-w-[600px] mx-auto bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 p-4 sm:p-6 rounded-2xl backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            Your all-in-one solution for managing business finances, inventory,
            and customer relationships.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full max-w-6xl">
          {/* Sign In Container */}
          <div className="w-full bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-6 sm:p-8 hover:border-blue-500/50 transition-all duration-300 opacity-100">
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full max-w-none",
                  card: "bg-transparent shadow-none w-full border-none",
                  formButtonPrimary:
                    "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] font-medium text-sm h-10",
                  headerTitle:
                    "bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent text-xl font-bold mb-2",
                  headerSubtitle: "text-slate-300 text-sm mb-4",
                  socialButtonsBlockButton:
                    "border-slate-700 hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:scale-[1.02] text-slate-300 h-10",
                  formFieldLabel: "text-slate-300 font-medium text-sm mb-1",
                  formFieldInput:
                    "bg-slate-800/50 border-slate-700 rounded-xl transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 text-slate-300 text-sm h-10 px-3",
                  footerActionLink:
                    "text-blue-400 hover:text-blue-300 transition-colors duration-300 hover:underline text-sm",
                  formFieldInputShowPasswordButton:
                    "text-slate-400 hover:text-slate-300",
                  identityPreviewEditButton:
                    "text-blue-400 hover:text-blue-300",
                  formFieldAction: "text-blue-400 hover:text-blue-300 text-sm",
                  formFieldInputWrapper: "mb-2",
                  formField: "mb-4",
                  formButtonReset:
                    "text-sm text-slate-400 hover:text-slate-300",
                  footer: "mt-4",
                  footerAction: "text-center",
                  socialButtons: "space-y-2",
                  socialButtonsBlock: "space-y-2 mb-4",
                  socialButtonsBlockButtonText: "text-sm text-slate-300",
                  dividerRow: "my-4",
                  dividerText: "text-slate-400 text-sm",
                  dividerLine: "bg-slate-700",
                },
              }}
            />
          </div>

          {/* About Container */}
          <div className="w-full bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-6 sm:p-8 hover:border-blue-500/50 transition-all duration-300 opacity-100">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent">
                About Zaryan
              </h2>

              <div className="relative w-full h-40 sm:h-48 rounded-xl overflow-hidden group">
                <Image
                  src="/1.jpg"
                  alt="Zaryan Features Preview"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="space-y-4">
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Experience the power of an all-in-one business management
                  platform designed for modern enterprises.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 opacity-100">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-1 sm:mb-2">
                      Advanced Analytics
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Real-time insights into your business performance
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 opacity-100">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-1 sm:mb-2">
                      Secure Platform
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Enterprise-grade security for your business data
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 opacity-100">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-1 sm:mb-2">
                      Easy Integration
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Seamlessly connect with your existing tools
                    </p>
                  </div>

                  <div className="p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 opacity-100">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-1 sm:mb-2">
                      24/7 Support
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Dedicated support team always ready to help
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

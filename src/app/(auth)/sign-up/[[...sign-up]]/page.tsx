"use client";
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { SignUp } from "@clerk/nextjs";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

export default function Page() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Enhanced GSAP animations for background elements
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".bg-blob", {
      scale: 0,
      opacity: 0,
      duration: 1.5,
      stagger: 0.2,
    })
      .from(".floating-blob", {
        y: "30px",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      })
      .from(".auth-container", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
      })
      .from(
        ".about-container",
        {
          x: 50,
          opacity: 0,
          duration: 0.8,
        },
        "-=0.4"
      )
      .from(
        ".feature-card",
        {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
        },
        "-=0.2"
      );
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full relative overflow-hidden min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
    >
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="bg-blob absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-600/20 via-slate-600/20 to-slate-700/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="bg-blob floating-blob absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-slate-600/20 via-slate-700/20 to-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="bg-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-slate-700/20 via-slate-800/20 to-blue-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative w-full max-w-[1200px] mx-auto px-4 flex flex-col items-center justify-center min-h-screen py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-7xl font-bold tracking-tight"
          >
            Join{" "}
            <motion.span
              className="bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "100%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              Zaryan
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-slate-300 max-w-[600px] mx-auto bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 p-6 rounded-2xl backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300"
          >
            Create your account and start managing your business finances
            efficiently.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-[1000px]">
          <motion.div
            className="auth-container w-full bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none w-full",
                  formButtonPrimary:
                    "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105",
                  headerTitle:
                    "bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent text-xl font-bold",
                  headerSubtitle: "text-slate-300 text-sm",
                  socialButtonsBlockButton:
                    "border-slate-700 hover:bg-slate-700/50 rounded-xl transition-all duration-300 hover:scale-105 text-slate-300",
                  formFieldLabel: "text-slate-300 font-medium text-sm",
                  formFieldInput:
                    "bg-slate-800/50 border-slate-700 rounded-xl transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-500/50 text-slate-300 text-sm",
                  footerActionLink:
                    "text-blue-400 hover:text-blue-300 transition-colors duration-300 hover:underline text-sm",
                  formFieldInputShowPasswordButton:
                    "text-slate-400 hover:text-slate-300",
                  identityPreviewEditButton:
                    "text-blue-400 hover:text-blue-300",
                  formFieldAction: "text-blue-400 hover:text-blue-300",
                  formFieldInputWrapper: "gap-1",
                  formField: "gap-1",
                  formButtonReset: "text-sm text-slate-400",
                  footer: "gap-1",
                  footerAction: "gap-1",
                  socialButtons: "gap-2",
                  socialButtonsBlock: "gap-2",
                  socialButtonsBlockButtonText: "text-sm text-slate-300",
                  formFieldAction__signIn: "text-sm",
                  formFieldAction__signUp: "text-sm",
                },
              }}
            />
          </motion.div>

          <motion.div
            className="about-container w-full bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-y-6">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-slate-300 to-blue-500 bg-clip-text text-transparent"
              >
                Why Choose Zaryan?
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="relative w-full h-48 rounded-xl overflow-hidden mb-4 group"
              >
                <Image
                  src="/2.jpg"
                  alt="Zaryan Features Preview"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
                <p className="text-slate-300">
                  Experience the power of an all-in-one business management
                  platform designed for modern enterprises.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className="feature-card p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">
                      Powerful Features
                    </h3>
                    <p className="text-sm text-slate-300">
                      Comprehensive tools for business management
                    </p>
                  </motion.div>
                  <motion.div
                    className="feature-card p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">
                      24/7 Support
                    </h3>
                    <p className="text-sm text-slate-300">
                      Dedicated support team always ready to help
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

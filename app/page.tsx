"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-gray-100 dark:from-black dark:to-gray-800 text-gray-900 dark:text-gray-100 antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="pt-20 sm:pt-32">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400"
          >
            Web3 Innovators Hub
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl max-w-3xl mx-auto mb-10 text-gray-700 dark:text-gray-300 text-center"
          >
            Participate in AI-driven Web3 challenges, build solutions, and
            secure instant crypto rewards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center mb-20 sm:mb-32"
          >
            <Link
              href="/tasks"
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Get Started
            </Link>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="pb-20">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Dynamic AI Challenges",
                description:
                  "Unlock cutting-edge Web3 problems designed to push your skills to new heights.",
                icon: "⚡",
              },
              {
                title: "AI-Powered Evaluation",
                description:
                  "Submit your solutions and receive immediate AI-driven feedback and scoring.",
                icon: "🧠",
              },
              {
                title: "Crypto Rewards",
                description:
                  "Compete and win! Top developers earn prizes sent instantly via smart contracts.",
                icon: "🌟",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-lg shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer Section */}
        <footer className="py-20 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400"
          >
            Join the Revolution in Web3 Development
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10"
          >
            Whether you are a seasoned developer or a beginner test your skills
            learn and grow while earning crypto rewards.
          </motion.p>
          <Link
            href="/tasks"
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Start Exploring
          </Link>
        </footer>
      </main>
    </div>
  );
}

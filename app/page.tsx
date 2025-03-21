"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import Link from "next/link";

// Animation variants for reuse
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  // Feature card data
  const featureCards = [
    {
      title: "Dynamic AI Challenges",
      description: "Unlock cutting-edge Web3 problems designed to push your skills to new heights.",
      icon: "⚡",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "AI-Powered Evaluation",
      description: "Submit your solutions and receive immediate AI-driven feedback and scoring.",
      icon: "🧠",
      color: "from-purple-500 to-pink-600",
    },
    {
      title: "Crypto Rewards",
      description: "Compete and win! Top developers earn prizes sent instantly via smart contracts.",
      icon: "🌟",
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Learning Resources",
      description: "Access a vast library of Web3 tutorials, documentation, and best practices.",
      icon: "📚",
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Community Support",
      description: "Join a thriving community of like-minded developers and industry experts.",
      icon: "👥",
      color: "from-rose-500 to-red-600",
    },
    {
      title: "Blockchain Certifications",
      description: "Earn verifiable on-chain certificates that showcase your Web3 expertise.",
      icon: "🏆",
      color: "from-cyan-500 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-gray-100 dark:from-black dark:to-gray-800 text-gray-900 dark:text-gray-100 antialiased">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="pt-20 sm:pt-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 },
            }}
            transition={{ staggerChildren: 0.2 }}
            className="text-center"
          >
            <motion.h1
              variants={fadeIn}
              transition={{ duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-gray-100 dark:via-gray-300 dark:to-gray-400"
            >
              Web3 Innovators Hub
            </motion.h1>

            <motion.p
              variants={fadeIn}
              transition={{ duration: 0.8 }}
              className="text-xl sm:text-2xl max-w-3xl mx-auto mb-10 text-gray-700 dark:text-gray-300"
            >
              Participate in AI-driven Web3 challenges, build solutions, and
              secure instant crypto rewards.
            </motion.p>

            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.8 }}
              className="flex justify-center mb-20 sm:mb-32"
            >
              <Link
                href="/tasks"
                className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 text-white rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="pb-24">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 dark:from-gray-100 dark:via-gray-300 dark:to-gray-400"
          >
            Platform Features
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="cursor-pointer"
              >
                <Card className="h-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200 dark:border-gray-700 overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${item.color}`}></div>
                  <div className="flex items-center mb-4">
                    <div className={`text-4xl bg-gradient-to-br ${item.color} text-transparent bg-clip-text`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold ml-3 text-gray-800 dark:text-gray-200">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl mb-20">
          <div className="text-center px-4">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400"
            >
              Join the Revolution in Web3 Development
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10"
            >
              Whether you're a seasoned developer or a beginner, test your skills,
              learn, and grow while earning crypto rewards.
            </motion.p>
            <Link
              href="/tasks"
              className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 text-white rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              Start Exploring
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

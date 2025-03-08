"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";

const ContactPageAnimation = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const controls = useAnimation();

  const handleMouseMove = useCallback(
    (event: {
      currentTarget: { getBoundingClientRect: () => DOMRect };
      clientX: number;
      clientY: number;
    }) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setCursorPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    []
  );

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const svgVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.2,
      },
    },
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
      },
    },
  };

  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const pulseVariants = {
    hidden: { scale: 0.8, opacity: 0.5 },
    visible: {
      scale: 1.2,
      opacity: 1,
      transition: {
        yoyo: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  const messageVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  };

  return (
    <div
      className="w-full h-full relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <motion.svg
        viewBox="0 0 800 600"
        initial="hidden"
        animate="visible"
        variants={svgVariants}
        className="w-full h-full"
      >
        <defs>
          <radialGradient
            id="globalGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Global connectivity background */}
        <motion.circle
          cx="400"
          cy="300"
          r="280"
          fill="url(#globalGradient)"
          variants={nodeVariants}
        />

        {/* Communication paths */}
        <motion.path
          d="M100,300 C250,100 550,500 700,300"
          stroke="#60A5FA"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          variants={pathVariants}
        />
        <motion.path
          d="M100,400 C250,600 550,200 700,400"
          stroke="#60A5FA"
          strokeWidth="2"
          fill="none"
          filter="url(#glow)"
          variants={pathVariants}
        />

        {/* Communication nodes */}
        {[
          { cx: 100, cy: 300 },
          { cx: 700, cy: 300 },
          { cx: 100, cy: 400 },
          { cx: 700, cy: 400 },
          { cx: 400, cy: 300 },
        ].map((node, index) => (
          <g key={index}>
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r="12"
              fill="#2563EB"
              variants={nodeVariants}
              whileHover={{ scale: 1.5, fill: "#3B82F6" }}
            />
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r="20"
              stroke="#60A5FA"
              strokeWidth="2"
              fill="none"
              variants={pulseVariants}
            />
          </g>
        ))}

        {/* Message animations */}
        <motion.circle
          cx="100"
          cy="300"
          r="8"
          fill="#F59E0B"
          variants={messageVariants}
        />
        <motion.circle
          cx="700"
          cy="400"
          r="8"
          fill="#F59E0B"
          variants={messageVariants}
        />

        {/* Interactive cursor effect */}
        <motion.circle
          cx={cursorPosition.x}
          cy={cursorPosition.y}
          r={isHovering ? "30" : "0"}
          fill="#F59E0B"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovering ? 0.3 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Central icon */}
        <motion.path
          d="M385,285 h30 v30 h-30 Z M400,270 v60 M370,300 h60"
          stroke="#F59E0B"
          strokeWidth="4"
          fill="none"
          variants={pathVariants}
        />

        {/* Animated text */}
        <motion.text
          x="400"
          y="550"
          textAnchor="middle"
          fill="#fff"
          fontSize="24"
          fontWeight="bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          Connect • Communicate • Collaborate
        </motion.text>
      </motion.svg>
    </div>
  );
};

export default ContactPageAnimation;

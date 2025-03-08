"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, User, MessageSquare, Send } from "lucide-react";
import ContactPageAnimation from "@/components/svg/contactsvg";
import { toast } from "sonner";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please Enter the Correct Email" }),
  subject: z
    .string()
    .min(3, { message: "Subject must be at least 3 characters" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll get back to you soon.", {
        duration: 5000,
      });
      reset();
    } catch (error) {
      console.error(error);
      toast.error(
        "An error occurred while sending the message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full flex flex-col lg:flex-row items-center justify-between">
        <motion.div
          className="lg:w-1/2 mb-8 lg:mb-0"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Let&apos;s Connect <br /> and Create
          </h1>
          <p className="text-xl text-black/80 dark:text-white/80 mb-8">
            Reach out and let&apos;s turn your ideas into reality.
          </p>
          <ContactPageAnimation />
        </motion.div>

        <motion.div
          className="lg:w-1/2"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-lg shadow-xl w-full max-w-md mx-auto">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Send size={24} />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                    <p className="text-white/80">
                      We&apos;ll get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1"
                      >
                        Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 dark:text-white/50"
                          size={18}
                        />
                        <Input
                          id="name"
                          {...register("name")}
                          className="bg-white/20 placeholder-white/50 pl-10 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                          placeholder="Your name"
                        />
                      </div>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-300 text-sm mt-1"
                        >
                          {errors.name.message}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 dark:text-white/50"
                          size={18}
                        />
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          className="bg-white/20 placeholder-white/50 pl-10 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                          placeholder="your@subject.com"
                        />
                      </div>
                      {errors.subject && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-300 text-sm mt-1"
                        >
                          {errors.email?.message}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium mb-1"
                      >
                        Subject
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/50 dark:text-white/50"
                          size={18}
                        />
                        <Input
                          id="subject"
                          type="subject"
                          {...register("subject")}
                          className="bg-white/20 placeholder-white/50 pl-10 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                          placeholder="Your Subject"
                        />
                      </div>
                      {errors.subject && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-300 text-sm mt-1"
                        >
                          {errors.subject.message}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium mb-1"
                      >
                        Message
                      </label>
                      <div className="relative">
                        <MessageSquare
                          className="absolute left-3 top-3 text-black/50 dark:text-white/50"
                          size={18}
                        />
                        <Textarea
                          id="message"
                          {...register("message")}
                          className="bg-white/20 placeholder-white/50 pl-10 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                          placeholder="Your message"
                          rows={4}
                        />
                      </div>
                      {errors.message && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-300 text-sm mt-1"
                        >
                          {errors.message.message}
                        </motion.p>
                      )}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;

"use client";

import { useState } from "react";
import { EB_Garamond } from "next/font/google";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          description: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("[ContactForm-handleSubmit] Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label 
            htmlFor="name" 
            className={`${ebGaramond.className} block text-lg font-semibold text-gray-700 mb-2`}
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={`${ebGaramond.className} w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900`}
            placeholder="Your full name"
          />
        </div>

        {/* Email Field */}
        <div>
          <label 
            htmlFor="email" 
            className={`${ebGaramond.className} block text-lg font-semibold text-gray-700 mb-2`}
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`${ebGaramond.className} w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900`}
            placeholder="your.email@example.com"
          />
        </div>

        {/* Phone Field */}
        <div>
          <label 
            htmlFor="phone" 
            className={`${ebGaramond.className} block text-lg font-semibold text-gray-700 mb-2`}
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`${ebGaramond.className} w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900`}
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Subject Field */}
        <div>
          <label 
            htmlFor="subject" 
            className={`${ebGaramond.className} block text-lg font-semibold text-gray-700 mb-2`}
          >
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className={`${ebGaramond.className} w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900`}
            placeholder="What can we help you with?"
          />
        </div>

        {/* Description Field */}
        <div>
          <label 
            htmlFor="description" 
            className={`${ebGaramond.className} block text-lg font-semibold text-gray-700 mb-2`}
          >
            Message *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            className={`${ebGaramond.className} w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 resize-vertical`}
            placeholder="Please tell us about your inquiry, event details, or any questions you have..."
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${ebGaramond.className} w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-8 rounded-lg transition-colors duration-200 text-lg`}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className={`${ebGaramond.className} bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg`}>
            Thank you for your message! We&apos;ll get back to you soon.
          </div>
        )}

        {submitStatus === "error" && (
          <div className={`${ebGaramond.className} bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg`}>
            There was an error sending your message. Please try again or contact us directly.
          </div>
        )}
      </form>
    </div>
  );
}
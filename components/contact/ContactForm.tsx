"use client";

import { useState } from "react";
import { Input, Textarea, Label, Button } from "@/components/ui";
import { isValidEmail } from "@/lib/utils/validation";

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
  const [emailError, setEmailError] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "email" && emailError) setEmailError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email format before sending (the API rejects bad emails too).
    if (!isValidEmail(formData.email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);

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
      console.error(
        "[ContactForm-handleSubmit] Error submitting form:",
        error
      );
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name" required>
            Name
          </Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your full name"
          />
        </div>
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={emailError}
            aria-invalid={emailError}
            required
            placeholder="your.email@example.com"
          />
          {emailError && (
            <p className="mt-1 text-sm text-[var(--color-error)]">
              Enter a valid email address.
            </p>
          )}
        </div>
      </div>

      {/* Phone + Subject row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="subject" required>
            Subject
          </Label>
          <Input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="What can we help with?"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="description" required>
          Message
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="min-h-[160px]"
          placeholder="Tell us about your inquiry, event details, or any questions you have..."
        />
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </div>

      {/* Status Messages */}
      {submitStatus === "success" && (
        <div className="rounded-lg bg-[var(--color-success-light)] border border-[var(--color-success)] text-[var(--color-success-text)] px-4 py-3 text-sm text-center">
          Thank you for your message! We&apos;ll get back to you soon.
        </div>
      )}

      {submitStatus === "error" && (
        <div className="rounded-lg bg-[var(--color-error-light)] border border-[var(--color-error)] text-[var(--color-error-text)] px-4 py-3 text-sm text-center">
          There was an error sending your message. Please try again or contact
          us directly.
        </div>
      )}
    </form>
  );
}

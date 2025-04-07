"use client";
import { useState, useEffect } from "react";

export default function Calendar() {
  const [dates, setDates] = useState<Date[]>([]);

  useEffect(() => {
    // Get today's date and create an array of the next 5 days
    const today = new Date();
    const nextFiveDays = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
    setDates(nextFiveDays);
  }, []);

  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDate = (date: Date) => {
    return date.getDate();
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-secondary uppercase tracking-widest text-sm font-medium mb-3">
              Plan Your Visit
            </h4>
            <h3 className="serif text-4xl font-bold text-primary mb-4">
              Upcoming Workshops
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our calendar to find the perfect class or workshop for your
              creative journey.
            </p>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-6 min-w-max pb-4">
              {dates.map((date, index) => (
                <div
                  key={index}
                  className="workshop-day border border-gray-200 rounded-lg overflow-hidden min-w-[220px] shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="bg-primary text-black text-center py-4">
                    <p className="text-lg font-medium mt-2 text-black">
                      {formatDay(date)}
                    </p>
                    <p className="text-sm uppercase tracking-wider text-black/80">
                      {formatMonth(date)}
                    </p>
                    <p className="text-3xl font-bold mt-1 text-black">
                      {formatDate(date)}
                    </p>
                  </div>
                  <div className="p-5 bg-white">
                    <div className="border-b border-gray-100 pb-4 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-primary">
                          Watercolor Basics
                        </p>
                        <p className="text-xs bg-blue-100 text-secondary px-2 py-1 rounded-full">
                          9:00 AM
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        All skill levels welcome
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-primary">
                          Kids Craft Hour
                        </p>
                        <p className="text-xs bg-orange-100 text-accent px-2 py-1 rounded-full">
                          3:30 PM
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">Ages 5-12</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-10">
            <a
              href="#"
              className="inline-block border border-primary text-primary hover:bg-primary hover:text-white font-medium px-8 py-3 rounded-md transition duration-300"
            >
              View Full Calendar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { ReactElement } from "react";
import ReservationsList from "@/components/reservations/ReservationsList";

export default function ReservationsPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Multi-Day Reservations
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-6 max-w-3xl mx-auto">
              Book your spot for our immersive multi-day creative experiences. 
              Choose your dates and customize your participation for the perfect artistic journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🎨</span>
                <span>Choose Your Days</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">👥</span>
                <span>Customize Participants</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">💳</span>
                <span>Flexible Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Available Reservations
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl">
            Browse our upcoming multi-day creative experiences. Each reservation allows you to select specific dates 
            and customize the number of participants for each day to fit your schedule and group size.
          </p>
        </div>

        {/* Reservations List */}
        <ReservationsList className="mb-12" />

        {/* Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">How Reservations Work</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📅</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">1. Choose Your Dates</h4>
              <p className="text-gray-600 text-sm">
                Select from available dates within the reservation period. You can choose consecutive or non-consecutive days based on your schedule.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">2. Set Participants</h4>
              <p className="text-gray-600 text-sm">
                Customize the number of participants for each selected day. Perfect for varying group sizes throughout your experience.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">3. Complete Booking</h4>
              <p className="text-gray-600 text-sm">
                Review your selections, provide participant details, and complete payment. You&apos;ll receive confirmation with all the details.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">✨ Flexible Scheduling</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Choose any combination of available dates
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                No requirement for consecutive days
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Adjust participants per day as needed
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">🎯 Perfect for Groups</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Bring different people on different days
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Accommodate varying schedules
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                Transparent pricing per participant per day
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

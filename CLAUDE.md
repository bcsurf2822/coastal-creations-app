# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15 application for Coastal Creations Studio, an art studio in Ocean City, NJ. It handles class bookings, event management, payments, and content management.

## Essential Commands

```bash
# Development
npm run dev       # Start development server with Turbopack
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint

# When making changes, always run:
npm run lint      # Ensure code follows project standards
npm run build     # Verify build succeeds before committing
```

## High-Level Architecture

### Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4 + Material UI
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth v4 with Google OAuth
- **CMS**: Sanity for content management
- **Payments**: Square Web Payments SDK
- **Email**: Resend API

### Directory Structure
- `/app` - Next.js App Router pages and API routes
  - `/admin` - Protected admin dashboard
  - `/api` - Backend API routes (auth, events, payments)
  - Other directories are public-facing pages
- `/components` - React components organized by feature
- `/lib` - Utilities and data models
  - `/models` - Mongoose schemas (Event, Customer, Birthday, PaymentError)
- `/types` - TypeScript type definitions

### Key Architectural Patterns

1. **Authentication Flow**
   - Google OAuth only, restricted to specific emails in auth.ts
   - Admin routes protected by middleware
   - Session management via NextAuth

2. **Data Architecture**
   - MongoDB for application data (events, customers, payments)
   - Sanity CMS for content (blog posts, gallery images)
   - Mongoose models define schema structure

3. **API Design**
   - RESTful routes in `/app/api`
   - Server-side validation
   - Error handling with structured responses

4. **Event Management System**
   - Support for multiple event types (classes, camps, parties)
   - Recurring events functionality
   - Calendar integration with FullCalendar
   - Email confirmations via Resend

5. **Payment Processing**
   - Square integration in `/app/api/payment`
   - Payment errors logged to MongoDB
   - Success/failure page flows

### Development Guidelines

1. **Component Structure**
   - Use TypeScript for all new components
   - Follow existing component patterns in respective directories
   - Material UI components for admin dashboard
   - TailwindCSS for public-facing pages

2. **API Development**
   - All API routes should handle errors gracefully
   - Use proper HTTP status codes
   - Validate input data server-side
   - Log errors to appropriate collections

3. **Database Operations**
   - Use Mongoose models from `/lib/models`
   - Handle connection errors
   - Avoid exposing sensitive data in API responses

4. **Environment Variables**
   - Authentication: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET
   - Database: MONGODB_URI
   - Payment: SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID
   - Email: RESEND_API_KEY
   - CMS: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET

### Common Tasks

1. **Adding New Events**
   - Update Event model if new fields needed
   - Add validation in API routes
   - Update admin dashboard forms
   - Test calendar display

2. **Modifying Email Templates**
   - Edit components in `/components/email-templates`
   - Test with Resend preview
   - Verify customer data is properly formatted

3. **Admin Dashboard Updates**
   - Components in `/components/dashboard`
   - Protected routes in `/app/admin`
   - Use Material UI for consistency

4. **Payment Integration**
   - Square SDK configuration in payment components
   - Error handling in `/app/api/payment`
   - Log failures to PaymentError collection
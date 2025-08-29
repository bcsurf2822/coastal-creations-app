# Coastal Creations Studio

An art studio web application for class bookings, event management, and creative workshops in Ocean City, NJ.

## Studio Information

**Coastal Creations Studio**  
411 E 8th Street  
Ocean City, NJ 08226  
Owner: Ashley Mathers  

**Website Development**  
Developer: Benjamin Corbett  


## About

Coastal Creations Studio is a vibrant art studio maintained by Ashley Mathers, offering a variety of creative classes, workshops, camps, and birthday parties for all ages. Our mission is to inspire creativity and provide a welcoming space for artistic expression in the Ocean City community.

## Features

### For Customers
- **Class Registration** - Browse and sign up for art classes online
- **Event Booking** - Book workshops, camps, and birthday parties
- **Online Payments** - Secure payment processing through Square
- **Calendar View** - View upcoming classes and events
- **Gallery** - Browse artwork and studio photos
- **Automated Confirmations** - Receive email confirmations for bookings

### For Administrators
- **Admin Dashboard** - Comprehensive dashboard for managing all aspects of the studio
- **Event Management** - Create, edit, and manage classes and events
- **Customer Management** - View and manage customer registrations
- **Payment Tracking** - Monitor payments and transaction history
- **Email System** - Automated email notifications for customers and admins
- **Content Management** - Update gallery, blog posts, and studio information
- **Analytics** - Track registrations and studio performance

## Screenshots

### Home Page
![Home Page](public/assets/readme.images/home.png)

### Classes Page
![Classes Page](public/assets/readme.images/classes.png)

### Registration & Payment
![Square Registration](public/assets/readme.images/square.register.png)

### Admin Dashboard - Classes Management
![Admin Classes](public/assets/readme.images/admin.classes.png)

### Admin Dashboard - Add Event
![Admin Add Event](public/assets/readme.images/admin.addevent.png)

## Live Website

Visit us at: [https://coastalcreationsstudio.com/](https://coastalcreationsstudio.com/)

## 💻 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) - React framework for production
- **Database:** [MongoDB](https://www.mongodb.com/) with Mongoose ODM
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Material UI
- **Authentication:** NextAuth with Google OAuth
- **Payments:** [Square](https://squareup.com/) Web Payments SDK
- **CMS:** [Sanity](https://www.sanity.io/) for content management
- **Email:** [Resend](https://resend.com/) API for transactional emails
- **Hosting:** [Vercel](https://vercel.com/)
- **Language:** TypeScript

## 🛠️ Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/coastal-creations-app.git
cd coastal-creations-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with the following variables:
```env
# Database
MONGODB_URI=your_mongodb_uri

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Payment
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_APPLICATION_ID=your_square_application_id

# Email
RESEND_API_KEY=your_resend_api_key

# CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=your_sanity_dataset
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

This is a private project for Coastal Creations Studio. For any inquiries or issues, please contact Benjamin Corbett at crystaledgedev22@gmail.com.

## License

Copyright © 2025 Coastal Creations Studio. All rights reserved.

---
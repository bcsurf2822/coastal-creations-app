import type { PageContent } from "@/types/pageContent";

// Default page content that serves as fallbacks when Sanity CMS data is not available
export const DEFAULT_PAGE_CONTENT: PageContent = {
  homepage: {
    hero: {
      heading: "Welcome to Coastal Creations Studio",
      ctaButton1: "Explore Classes",
      ctaButton2: "About Us",
    },
    mainSection: {
      title: "Our Creative Space",
      description: undefined, // Will use plain text in component
    },
    offerings: {
      sectionTitle: "Creative Experiences",
      sectionSubtitle: undefined, // Will use plain text in component
      artCamps: {
        title: "Art Camps",
        description: undefined, // Will use plain text in component
      },
      classesWorkshops: {
        title: "Classes & Workshops",
        description: undefined, // Will use plain text in component
      },
      privateEvents: {
        title: "Private Events",
        description: undefined, // Will use plain text in component
      },
    },
    upcomingWorkshops: {
      label: "Plan Your Visit",
      title: "Upcoming Workshops",
      subtitle: undefined, // Will use plain text in component
    },
  },
  eventPages: {
    adultClasses: {
      title: "Adult Classes",
      description: undefined, // Will use plain text in component
    },
    kidClasses: {
      title: "Kid Classes",
      description: undefined, // Will use plain text in component
    },
    camps: {
      title: "Art Camps",
      description: undefined, // Will use plain text in component
    },
    privateEvents: {
      title: "Private Events",
      description: undefined, // Will use plain text in component
    },
  },
  otherPages: {
    reservations: {
      title: "Reservations",
      description: undefined, // Will use plain text in component
    },
    gallery: {
      title: "Gallery",
      description: undefined, // Will use plain text in component
    },
    about: {
      title: "Our Studio",
      description: undefined, // Will use plain text in component
    },
  },
};

// Plain text versions for fallbacks in components
export const DEFAULT_TEXT = {
  homepage: {
    hero: {
      heading: "Welcome to Coastal Creations Studio",
      ctaButton1: "Explore Classes",
      ctaButton2: "About Us",
    },
    mainSection: {
      title: "Our Creative Space",
      description:
        "Coastal Creations Studio is a walk-in art studio where creativity comes to life! We offer a fun, hands-on experience for all ages — no appointment needed. Choose from canvas painting, collage making, mosaics, and more. Looking for a guided experience? Sign up for one of our engaging workshops led by friendly, local artists. Whether you're a beginner or experienced creator, Coastal Creations is the perfect place to relax, get inspired, and make your own masterpiece!",
    },
    offerings: {
      sectionTitle: "Creative Experiences",
      sectionSubtitle:
        "We provide a variety of classes, workshops, and creative opportunities for artists of all ages and skill levels!",
      artCamps: {
        title: "Art Camps",
        description:
          "Hands-on art camps where kids explore creativity, build skills, and have fun together.",
      },
      classesWorkshops: {
        title: "Classes & Workshops",
        description:
          "Weekly workshops offering focused, guided art sessions for kids and adults of all skill levels.",
      },
      privateEvents: {
        title: "Private Events",
        description:
          "Our art-themed events include guided projects, materials, and colorful memories!",
      },
    },
    upcomingWorkshops: {
      label: "Plan Your Visit",
      title: "Upcoming Workshops",
      subtitle:
        "Browse our calendar to find the perfect class or workshop for your creative journey.",
    },
  },
  eventPages: {
    adultClasses: {
      title: "Adult Classes",
      description:
        "Unleash your creativity with our adult art classes. No experience necessary — just bring your passion!",
    },
    kidClasses: {
      title: "Kid Classes",
      description:
        "Creative art classes designed for young artists. Fun, educational, and inspiring!",
    },
    camps: {
      title: "Art Camps",
      description: "Spend your time Creating at Coastal Creations!",
    },
    privateEvents: {
      title: "Private Events",
      description:
        "Host your special event at Coastal Creations! Perfect for birthdays, team building, and celebrations.",
    },
  },
  otherPages: {
    reservations: {
      title: "Reservations",
      description:
        "Studio is Open for Walk Ins\nFriday-Monday 11:00am-5:00pm\n\nLate Night Open Studio is Available by Reservation Only",
    },
    gallery: {
      title: "Gallery",
      description:
        "Explore beautiful artwork created by our talented students and instructors.",
    },
    about: {
      title: "Our Studio",
      description:
        "Coastal Creations is a community-focused art studio located in the heart of Ocean City, New Jersey. Born from a lifelong dream and a love for creativity, our studio is a space where imagination thrives and artistic connections grow. Since I was 16, I've dreamed of creating a place where people of all ages and backgrounds could come together to express themselves through art — and now, that dream is a reality.",
    },
  },
};

import type { GalleryDestination } from "@/types/interfaces";

// Field definition for a text input in the editor
export interface FieldConfig {
  id: string;
  label: string;
  path: string[]; // Full path in PageContent (e.g. ["homepage", "hero", "heading"])
  type: "text" | "textarea";
  rows?: number;
  placeholder?: string;
  defaultValue: string;
}

// A group of related fields (e.g. "Hero Section", "Page Header")
export interface SectionConfig {
  id: string;
  label: string;
  fields: FieldConfig[];
  imagePath?: string[]; // Path to an image field in PageContent (e.g. ["homepage", "offerings", "artCamps", "image"])
}

// Wireframe section definition for the visual preview
export interface WireframeSectionConfig {
  id: string;
  label: string;
  linkedSectionId: string; // Maps to SectionConfig.id
  height?: string; // CSS height for the wireframe box
  gridCols?: number; // For multi-column layouts (e.g. 3 cards)
  children?: WireframeSectionConfig[];
}

// Full page configuration
export interface PageConfig {
  id: string;
  label: string;
  galleryDestination?: GalleryDestination;
  sections: SectionConfig[];
  wireframe: WireframeSectionConfig[];
}

// ── Page Configurations ─────────────────────────────────────────────────

export const PAGE_CONFIGS: PageConfig[] = [
  {
    id: "homepage",
    label: "Homepage",
    galleryDestination: "home-page",
    sections: [
      {
        id: "mainSection",
        label: "Main Section (Our Creative Space)",
        fields: [
          {
            id: "main-title",
            label: "Section Title",
            path: ["homepage", "mainSection", "title"],
            type: "text",
            defaultValue: "Our Creative Space",
          },
          {
            id: "main-description",
            label: "Description",
            path: ["homepage", "mainSection", "description"],
            type: "textarea",
            rows: 6,
            placeholder: "Enter the main section description...",
            defaultValue:
              "Coastal Creations Studio is a walk-in art studio where creativity comes to life! We offer a fun, hands-on experience for all ages — no appointment needed.",
          },
        ],
      },
      {
        id: "offerings",
        label: "Creative Experiences / Offerings",
        fields: [
          {
            id: "offerings-title",
            label: "Section Title",
            path: ["homepage", "offerings", "sectionTitle"],
            type: "text",
            defaultValue: "Creative Experiences",
          },
          {
            id: "offerings-subtitle",
            label: "Section Subtitle",
            path: ["homepage", "offerings", "sectionSubtitle"],
            type: "textarea",
            rows: 3,
            placeholder: "Enter the section subtitle...",
            defaultValue:
              "We provide a variety of classes, workshops, and creative opportunities for artists of all ages and skill levels!",
          },
        ],
      },
      {
        id: "artCamps",
        label: "Art Camps Card",
        imagePath: ["homepage", "offerings", "artCamps", "image"],
        fields: [
          {
            id: "artCamps-title",
            label: "Card Title",
            path: ["homepage", "offerings", "artCamps", "title"],
            type: "text",
            defaultValue: "Art Camps",
          },
          {
            id: "artCamps-description",
            label: "Card Description",
            path: ["homepage", "offerings", "artCamps", "description"],
            type: "textarea",
            rows: 3,
            defaultValue:
              "Hands-on art camps where kids explore creativity, build skills, and have fun together.",
          },
        ],
      },
      {
        id: "classesWorkshops",
        label: "Classes & Workshops Card",
        imagePath: ["homepage", "offerings", "classesWorkshops", "image"],
        fields: [
          {
            id: "classesWorkshops-title",
            label: "Card Title",
            path: ["homepage", "offerings", "classesWorkshops", "title"],
            type: "text",
            defaultValue: "Classes & Workshops",
          },
          {
            id: "classesWorkshops-description",
            label: "Card Description",
            path: [
              "homepage",
              "offerings",
              "classesWorkshops",
              "description",
            ],
            type: "textarea",
            rows: 3,
            defaultValue:
              "Weekly workshops offering focused, guided art sessions for kids and adults of all skill levels.",
          },
        ],
      },
      {
        id: "privateEventsCard",
        label: "Private Events Card",
        imagePath: ["homepage", "offerings", "privateEvents", "image"],
        fields: [
          {
            id: "privateEventsCard-title",
            label: "Card Title",
            path: ["homepage", "offerings", "privateEvents", "title"],
            type: "text",
            defaultValue: "Private Events",
          },
          {
            id: "privateEventsCard-description",
            label: "Card Description",
            path: ["homepage", "offerings", "privateEvents", "description"],
            type: "textarea",
            rows: 3,
            defaultValue:
              "Our art-themed events include guided projects, materials, and colorful memories!",
          },
        ],
      },
      {
        id: "upcomingWorkshops",
        label: "Upcoming Workshops Section",
        fields: [
          {
            id: "workshops-label",
            label: "Label (above title)",
            path: ["homepage", "upcomingWorkshops", "label"],
            type: "text",
            defaultValue: "Plan Your Visit",
          },
          {
            id: "workshops-title",
            label: "Section Title",
            path: ["homepage", "upcomingWorkshops", "title"],
            type: "text",
            defaultValue: "Upcoming Workshops",
          },
          {
            id: "workshops-subtitle",
            label: "Subtitle",
            path: ["homepage", "upcomingWorkshops", "subtitle"],
            type: "textarea",
            rows: 3,
            placeholder: "Enter the subtitle...",
            defaultValue:
              "Browse our calendar to find the perfect class or workshop for your creative journey.",
          },
        ],
      },
    ],
    wireframe: [
      { id: "wf-main", label: "Our Creative Space", linkedSectionId: "mainSection", height: "100px" },
      {
        id: "wf-offerings-header",
        label: "Creative Experiences",
        linkedSectionId: "offerings",
        height: "50px",
      },
      {
        id: "wf-offerings-cards",
        label: "Offering Cards",
        linkedSectionId: "offerings",
        height: "120px",
        gridCols: 3,
        children: [
          { id: "wf-camp-card", label: "Art Camps", linkedSectionId: "artCamps", height: "100%" },
          { id: "wf-class-card", label: "Classes", linkedSectionId: "classesWorkshops", height: "100%" },
          { id: "wf-private-card", label: "Private Events", linkedSectionId: "privateEventsCard", height: "100%" },
        ],
      },
      { id: "wf-upcoming", label: "Upcoming Workshops", linkedSectionId: "upcomingWorkshops", height: "80px" },
    ],
  },
  {
    id: "adultClasses",
    label: "Adult Classes",
    galleryDestination: "adult-class",
    sections: [
      {
        id: "pageHeader",
        label: "Page Header",
        fields: [
          {
            id: "adult-title",
            label: "Page Title",
            path: ["eventPages", "adultClasses", "title"],
            type: "text",
            defaultValue: "Adult Classes",
          },
          {
            id: "adult-description",
            label: "Page Description",
            path: ["eventPages", "adultClasses", "description"],
            type: "textarea",
            rows: 4,
            defaultValue:
              "Unleash your creativity with our adult art classes. No experience necessary — just bring your passion!",
          },
        ],
      },
    ],
    wireframe: [
      { id: "wf-header", label: "Page Header", linkedSectionId: "pageHeader", height: "90px" },
      { id: "wf-corral", label: "Photo Corral", linkedSectionId: "images", height: "60px" },
      {
        id: "wf-events",
        label: "Event Cards",
        linkedSectionId: "",
        height: "120px",
        gridCols: 3,
        children: [
          { id: "wf-e1", label: "Event", linkedSectionId: "", height: "100%" },
          { id: "wf-e2", label: "Event", linkedSectionId: "", height: "100%" },
          { id: "wf-e3", label: "Event", linkedSectionId: "", height: "100%" },
        ],
      },
    ],
  },
  {
    id: "kidClasses",
    label: "Kid Classes",
    galleryDestination: "kid-class",
    sections: [
      {
        id: "pageHeader",
        label: "Page Header",
        fields: [
          {
            id: "kid-title",
            label: "Page Title",
            path: ["eventPages", "kidClasses", "title"],
            type: "text",
            defaultValue: "Kid Classes",
          },
          {
            id: "kid-description",
            label: "Page Description",
            path: ["eventPages", "kidClasses", "description"],
            type: "textarea",
            rows: 4,
            defaultValue:
              "Creative art classes designed for young artists. Fun, educational, and inspiring!",
          },
        ],
      },
    ],
    wireframe: [
      { id: "wf-header", label: "Page Header", linkedSectionId: "pageHeader", height: "90px" },
      { id: "wf-corral", label: "Photo Corral", linkedSectionId: "images", height: "60px" },
      {
        id: "wf-events",
        label: "Event Cards",
        linkedSectionId: "",
        height: "120px",
        gridCols: 3,
        children: [
          { id: "wf-e1", label: "Event", linkedSectionId: "", height: "100%" },
          { id: "wf-e2", label: "Event", linkedSectionId: "", height: "100%" },
          { id: "wf-e3", label: "Event", linkedSectionId: "", height: "100%" },
        ],
      },
    ],
  },
  {
    id: "camps",
    label: "Camps",
    galleryDestination: "camp",
    sections: [
      {
        id: "pageHeader",
        label: "Page Header",
        fields: [
          {
            id: "camps-title",
            label: "Page Title",
            path: ["eventPages", "camps", "title"],
            type: "text",
            defaultValue: "Art Camps",
          },
          {
            id: "camps-description",
            label: "Page Description",
            path: ["eventPages", "camps", "description"],
            type: "textarea",
            rows: 4,
            defaultValue: "Spend your time Creating at Coastal Creations!",
          },
        ],
      },
    ],
    wireframe: [
      { id: "wf-header", label: "Page Header", linkedSectionId: "pageHeader", height: "90px" },
      { id: "wf-corral", label: "Photo Corral", linkedSectionId: "images", height: "60px" },
      {
        id: "wf-events",
        label: "Event Cards",
        linkedSectionId: "",
        height: "120px",
        gridCols: 3,
        children: [
          { id: "wf-e1", label: "Event", linkedSectionId: "", height: "100%" },
          { id: "wf-e2", label: "Event", linkedSectionId: "", height: "100%" },
          { id: "wf-e3", label: "Event", linkedSectionId: "", height: "100%" },
        ],
      },
    ],
  },
  {
    id: "privateEvents",
    label: "Private Events",
    galleryDestination: "private-event",
    sections: [
      {
        id: "pageHeader",
        label: "Page Header",
        fields: [
          {
            id: "private-title",
            label: "Page Title",
            path: ["eventPages", "privateEvents", "title"],
            type: "text",
            defaultValue: "Private Events",
          },
          {
            id: "private-description",
            label: "Page Description",
            path: ["eventPages", "privateEvents", "description"],
            type: "textarea",
            rows: 4,
            defaultValue:
              "Host your special event at Coastal Creations! Perfect for birthdays, team building, and celebrations.",
          },
        ],
      },
    ],
    wireframe: [
      { id: "wf-header", label: "Page Header", linkedSectionId: "pageHeader", height: "90px" },
      { id: "wf-corral", label: "Photo Corral", linkedSectionId: "images", height: "60px" },
      {
        id: "wf-events",
        label: "Event Cards",
        linkedSectionId: "",
        height: "120px",
        gridCols: 2,
        children: [
          { id: "wf-e1", label: "Offering", linkedSectionId: "", height: "100%" },
          { id: "wf-e2", label: "Offering", linkedSectionId: "", height: "100%" },
        ],
      },
    ],
  },
  {
    id: "reservations",
    label: "Reservations",
    galleryDestination: "reservation",
    sections: [
      {
        id: "pageHeader",
        label: "Page Header",
        fields: [
          {
            id: "reservations-title",
            label: "Page Title",
            path: ["otherPages", "reservations", "title"],
            type: "text",
            defaultValue: "Reservations",
          },
          {
            id: "reservations-description",
            label: "Page Description",
            path: ["otherPages", "reservations", "description"],
            type: "textarea",
            rows: 4,
            defaultValue:
              "Studio is Open for Walk Ins\nFriday-Monday 11:00am-5:00pm\n\nLate Night Open Studio is Available by Reservation Only",
          },
        ],
      },
    ],
    wireframe: [
      { id: "wf-header", label: "Page Header", linkedSectionId: "pageHeader", height: "90px" },
      { id: "wf-corral", label: "Photo Corral", linkedSectionId: "images", height: "60px" },
      {
        id: "wf-cards",
        label: "Reservation Cards",
        linkedSectionId: "",
        height: "120px",
        gridCols: 3,
        children: [
          { id: "wf-r1", label: "Reservation", linkedSectionId: "", height: "100%" },
          { id: "wf-r2", label: "Reservation", linkedSectionId: "", height: "100%" },
          { id: "wf-r3", label: "Reservation", linkedSectionId: "", height: "100%" },
        ],
      },
    ],
  },
  {
    id: "gallery",
    label: "Gallery",
    galleryDestination: "default-gallery",
    sections: [
      {
        id: "pageHeader",
        label: "Page Header",
        fields: [
          {
            id: "gallery-title",
            label: "Page Title",
            path: ["otherPages", "gallery", "title"],
            type: "text",
            defaultValue: "Gallery",
          },
          {
            id: "gallery-description",
            label: "Page Description",
            path: ["otherPages", "gallery", "description"],
            type: "textarea",
            rows: 4,
            defaultValue:
              "Explore beautiful artwork created by our talented students and instructors.",
          },
        ],
      },
    ],
    wireframe: [
      { id: "wf-header", label: "Page Header", linkedSectionId: "pageHeader", height: "90px" },
      {
        id: "wf-gallery",
        label: "Gallery Grid",
        linkedSectionId: "images",
        height: "200px",
        gridCols: 4,
        children: [
          { id: "wf-g1", label: "Photo", linkedSectionId: "images", height: "100%" },
          { id: "wf-g2", label: "Photo", linkedSectionId: "images", height: "100%" },
          { id: "wf-g3", label: "Photo", linkedSectionId: "images", height: "100%" },
          { id: "wf-g4", label: "Photo", linkedSectionId: "images", height: "100%" },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About",
    sections: [
      {
        id: "pageHeader",
        label: "Page Header",
        fields: [
          {
            id: "about-title",
            label: "Page Title",
            path: ["otherPages", "about", "title"],
            type: "text",
            defaultValue: "Our Studio",
          },
          {
            id: "about-description",
            label: "Page Description",
            path: ["otherPages", "about", "description"],
            type: "textarea",
            rows: 6,
            defaultValue:
              "Coastal Creations is a community-focused art studio located in the heart of Ocean City, New Jersey.",
          },
        ],
      },
    ],
    wireframe: [
      { id: "wf-header", label: "Page Header", linkedSectionId: "pageHeader", height: "90px" },
      { id: "wf-content", label: "About Content", linkedSectionId: "pageHeader", height: "180px" },
    ],
  },
];

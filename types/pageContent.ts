// Portable Text type for rich text content from Sanity
export type PortableTextBlock = {
  _type: 'block';
  _key: string;
  style?: string;
  listItem?: 'bullet' | 'number';
  markDefs?: unknown[];
  children: Array<{
    _type: 'span';
    _key: string;
    text: string;
    marks?: Array<'strong' | 'em' | 'underline'>;
  }>;
};

export type PortableTextContent = PortableTextBlock[];

// Hero Section
export interface HeroContent {
  heading?: string;
  ctaButton1?: string;
  ctaButton2?: string;
}

// Main Section
export interface MainSectionContent {
  title?: string;
  description?: PortableTextContent;
}

// Offering Card
export interface OfferingCard {
  title?: string;
  description?: PortableTextContent;
}

// Offerings Section
export interface OfferingsContent {
  sectionTitle?: string;
  sectionSubtitle?: PortableTextContent;
  artCamps?: OfferingCard;
  classesWorkshops?: OfferingCard;
  privateEvents?: OfferingCard;
}

// Upcoming Workshops Section
export interface UpcomingWorkshopsContent {
  label?: string;
  title?: string;
  subtitle?: PortableTextContent;
}

// Homepage
export interface HomepageContent {
  hero?: HeroContent;
  mainSection?: MainSectionContent;
  offerings?: OfferingsContent;
  upcomingWorkshops?: UpcomingWorkshopsContent;
}

// Page with Title and Description
export interface PageTitleDescription {
  title?: string;
  description?: PortableTextContent;
}

// Event Pages
export interface EventPagesContent {
  adultClasses?: PageTitleDescription;
  kidClasses?: PageTitleDescription;
  camps?: PageTitleDescription;
  privateEvents?: PageTitleDescription;
}

// Other Pages
export interface OtherPagesContent {
  reservations?: PageTitleDescription;
  gallery?: PageTitleDescription;
  about?: PageTitleDescription;
}

// Complete Page Content (root document)
export interface PageContent {
  _id?: string;
  _type?: string;
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
  homepage?: HomepageContent;
  eventPages?: EventPagesContent;
  otherPages?: OtherPagesContent;
}

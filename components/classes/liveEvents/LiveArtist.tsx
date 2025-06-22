"use client";

import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import {
  Box,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { motion } from "motion/react";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { client } from "@/sanity/client";
import {
  FaCalendarAlt,
  FaClock,
  FaPalette,
  FaUsers,
  FaEye,
} from "react-icons/fa";
import {
  GiPaintBrush,
  GiPaintRoller,
  GiMagicHat,
  GiPalette,
} from "react-icons/gi";

// Setup Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

// Define TypeScript interfaces for the event data
interface EventTime {
  startTime: string;
  endTime: string;
  _id: string;
}

interface EventDates {
  startDate: string;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
  excludeDates: string[];
  specificDates: string[];
  _id: string;
}

interface OptionChoice {
  name: string;
  _id: string;
}

interface EventOption {
  categoryName: string;
  categoryDescription: string;
  choices: OptionChoice[];
  _id: string;
}

interface Event {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  price?: number;
  dates: EventDates;
  time: EventTime;
  options: EventOption[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Styled Components
const StyledContainer = styled(Container)({
  padding: "4rem 2rem",
  maxWidth: "1200px",
  fontFamily: "var(--font-comic-neue)",
});

const Title = styled("h1")({
  fontSize: "2.75rem",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: "1.5rem",
  color: "#326C85",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1rem",
  "@media (max-width: 600px)": {
    fontSize: "2rem",
    flexDirection: "column",
    gap: "0.5rem",
  },
});

const TitleIcon = styled("div")({
  fontSize: "3rem",
  color: "#326C85",
  animation: "bounce 2s ease-in-out infinite",
  "@keyframes bounce": {
    "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
    "40%": { transform: "translateY(-10px)" },
    "60%": { transform: "translateY(-5px)" },
  },
});

const Subtitle = styled("p")({
  textAlign: "center",
  maxWidth: "600px",
  margin: "0 auto 3rem",
  fontSize: "1.125rem",
  color: "#616161",
  lineHeight: 1.6,
  fontWeight: "700",
});

const SectionTitle = styled("h2")({
  fontSize: "2rem",
  fontWeight: "700",
  marginBottom: "2rem",
  color: "#326C85",
  position: "relative",
  paddingLeft: "1rem",
  "&:before": {
    content: '""',
    position: "absolute",
    left: "0",
    top: "50%",
    transform: "translateY(-50%)",
    width: "4px",
    height: "100%",
    background: "linear-gradient(180deg, #326C85, #42A5F5)",
    borderRadius: "2px",
  },
});

interface ClassCardProps {
  isHovered: boolean;
}

const ClassCard = styled(Paper)<ClassCardProps>(({ isHovered }) => ({
  borderRadius: "20px",
  overflow: "hidden",
  position: "relative",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  boxShadow: isHovered
    ? "0 20px 40px rgba(50, 108, 133, 0.25)"
    : "0 8px 24px rgba(66, 165, 245, 0.15)",
  transform: isHovered
    ? "translateY(-8px) scale(1.02)"
    : "translateY(0) scale(1)",
  border: "2px solid transparent",
  background: isHovered
    ? "linear-gradient(white, white) padding-box, linear-gradient(135deg, #326C85, #42A5F5, #64B5F6) border-box"
    : "white",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: isHovered
      ? "linear-gradient(135deg, rgba(50,108,133,0.03), rgba(66,165,245,0.03))"
      : "transparent",
    opacity: 1,
    transition: "all 0.4s ease",
    zIndex: 0,
  },
}));

const CardContent = styled(Box)({
  padding: "2rem",
  position: "relative",
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
});

const TitleRow = styled("div")({
  display: "flex",
  gap: "1rem",
  marginBottom: "1.5rem",
  alignItems: "flex-start",
  "@media (max-width: 600px)": {
    gap: "0.75rem",
  },
});

const TitleSection = styled("div")({
  flex: 1,
  minWidth: 0, // Allows text to wrap properly
});

const ContentSection = styled("div")({
  display: "flex",
  flexDirection: "column",
});

const ImageSection = styled("div")({
  flexShrink: 0,
  marginTop: "0",
  "@media (max-width: 600px)": {
    width: "120px",
  },
  "@media (min-width: 601px)": {
    width: "140px",
  },
  "@media (min-width: 768px)": {
    width: "180px",
  },
});

const EventTitle = styled("h3")({
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: "0.75rem",
  color: "#326C85",
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-4px",
    left: "0",
    width: "0",
    height: "3px",
    background: "linear-gradient(90deg, #326C85, #42A5F5)",
    transition: "width 0.3s ease",
    borderRadius: "2px",
  },
  "&:hover:after": {
    width: "100%",
  },
});

const EventIcon = styled("span")({
  fontSize: "1.25rem",
  color: "#42A5F5",
  animation: "wiggle 2s ease-in-out infinite",
  "@keyframes wiggle": {
    "0%, 100%": { transform: "rotate(0deg)" },
    "25%": { transform: "rotate(5deg)" },
    "75%": { transform: "rotate(-5deg)" },
  },
});

const InfoGrid = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

const InfoItem = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  background:
    "linear-gradient(135deg, rgba(50,108,133,0.08), rgba(66,165,245,0.08))",
  borderRadius: "12px",
  border: "1px solid rgba(50,108,133,0.15)",
  fontSize: "0.875rem",
  color: "#424242",
  fontWeight: "700",
  marginBottom: "0.5rem",
  width: "fit-content",
});

const InfoIcon = styled("span")({
  color: "#42A5F5",
  fontSize: "1rem",
});

const Description = styled("p")({
  marginTop: "0.5rem",
  marginBottom: "1rem",
  color: "#616161",
  lineHeight: 1.6,
  flex: "1",
  textAlign: "justify",
  fontWeight: "700",
});

const EventBadge = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1rem",
  fontWeight: "bold",
  color: "white",
  background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
  padding: "0.5rem 1rem",
  borderRadius: "20px",
  position: "absolute",
  top: "15px",
  right: "15px",
  boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
  zIndex: 3,
  transform: "rotate(-2deg)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "rotate(0deg) scale(1.05)",
    boxShadow: "0 6px 20px rgba(255, 107, 107, 0.4)",
  },
});

const OptionsContainer = styled("div")({
  marginBottom: "1rem",
});

const OptionCategory = styled("div")({
  marginBottom: "0.5rem",
});

const OptionLabel = styled("span")({
  fontWeight: "700",
  color: "#326C85",
  fontSize: "0.875rem",
});

const OptionChips = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.25rem",
  marginTop: "0.25rem",
});

const StyledImage = styled(Image)({
  borderRadius: "12px",
  objectFit: "cover",
  width: "100%",
  height: "auto",
  aspectRatio: "4/3",
  transition: "all 0.3s ease",
  "@media (max-width: 600px)": {
    maxHeight: "90px",
  },
  "@media (min-width: 601px)": {
    maxHeight: "105px",
  },
  "@media (min-width: 768px)": {
    maxHeight: "135px",
  },
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  },
});

const StatusBadge = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  background: "linear-gradient(135deg, #4CAF50, #66BB6A)",
  color: "white",
  borderRadius: "25px",
  fontSize: "0.875rem",
  fontWeight: "700",
  boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
  marginTop: "1rem",
  width: "fit-content",
});

const LoadingContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "400px",
  gap: "1rem",
});

const LoadingText = styled("div")({
  color: "#326C85",
  fontSize: "1.25rem",
  fontWeight: "bold",
  animation: "colorChange 2s ease-in-out infinite",
  "@keyframes colorChange": {
    "0%, 100%": { color: "#326C85" },
    "50%": { color: "#42A5F5" },
  },
});

const EmptyState = styled("div")({
  textAlign: "center",
  padding: "3rem 2rem",
  background:
    "linear-gradient(135deg, rgba(50,108,133,0.05), rgba(66,165,245,0.05))",
  borderRadius: "20px",
  border: "2px solid rgba(50,108,133,0.1)",
  color: "#616161",
  fontSize: "1.125rem",
  fontWeight: "700",
});

export default function LiveArtist() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventPictures, setEventPictures] = useState<SanityDocument[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/events");

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();

        setEvents(data.events || []);
      } catch (err: unknown) {
        console.error("Error fetching events:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch event pictures
  useEffect(() => {
    const fetchEventPictures = async () => {
      try {
        const response = await fetch("/api/eventPictures");

        if (!response.ok) {
          throw new Error("Failed to fetch event pictures");
        }

        const data = await response.json();

        setEventPictures(data);
      } catch (err) {
        console.error("Error fetching event pictures:", err);
      }
    };

    fetchEventPictures();
  }, []);

  // Find a matching event picture for an event
  const findMatchingEventPicture = (eventName: string) => {
    if (!eventPictures || eventPictures.length === 0) return null;

    // Convert event name to lowercase for case-insensitive matching
    const eventNameLower = eventName.toLowerCase();

    // Find a picture where the title exactly matches the event name
    return eventPictures.find((picture) => {
      if (!picture.title) return false;
      const titleLower = picture.title.toLowerCase();
      return titleLower === eventNameLower;
    });
  };

  // Filter events to only show artist events and sort by date (upcoming first)
  const filteredEvents = events
    .filter((event) => {
      const eventType = event.eventType.toLowerCase();
      return eventType === "artist";
    })
    .sort((a, b) => {
      const dateA = new Date(a.dates.startDate);
      const dateB = new Date(b.dates.startDate);
      const now = new Date();

      // Separate upcoming and past events
      const aIsUpcoming = dateA >= now;
      const bIsUpcoming = dateB >= now;

      // If one is upcoming and one is past, upcoming comes first
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      // If both are upcoming, sort by earliest date first
      if (aIsUpcoming && bIsUpcoming) {
        return dateA.getTime() - dateB.getTime();
      }

      // If both are past, sort by most recent first
      return dateB.getTime() - dateA.getTime();
    });

  // Format dates in a readable way
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time from 24-hour to 12-hour format
  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Generate date information for the event
  const getDateInfo = (event: Event): string => {
    const { dates } = event;

    if (dates.isRecurring && dates.recurringPattern && dates.recurringEndDate) {
      return `${formatDate(dates.startDate)} to ${formatDate(dates.recurringEndDate)} (${dates.recurringPattern})`;
    } else {
      return formatDate(dates.startDate);
    }
  };

  // Check if event is in the past
  const isEventPast = (event: Event): boolean => {
    const eventDate = new Date(event.dates.startDate);
    const now = new Date();
    return eventDate < now;
  };

  const getRandomIcon = (index: number) => {
    const icons = [
      FaPalette,
      GiPaintBrush,
      GiPaintRoller,
      GiPalette,
      GiMagicHat,
    ];
    return icons[index % icons.length];
  };

  if (isLoading) {
    return (
      <StyledContainer>
        <LoadingContainer>
          <CircularProgress
            size={60}
            sx={{
              color: "#326C85",
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />
          <LoadingText>Loading live artist events... 🎨</LoadingText>
        </LoadingContainer>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: "15px",
            "& .MuiAlert-icon": {
              fontSize: "1.5rem",
            },
          }}
        >
          Error loading events: {error}
        </Alert>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Title>
        <TitleIcon>
          <FaPalette />
        </TitleIcon>
        Live Artist Painting
        <TitleIcon>
          <GiPaintBrush />
        </TitleIcon>
      </Title>

      <Subtitle>
        Watch talented artists create beautiful works live! Observe the creative
        process, learn new techniques, and be inspired by artistic mastery in
        action.
      </Subtitle>

      <SectionTitle>Live Artist Events</SectionTitle>

      {filteredEvents.length === 0 ? (
        <EmptyState>
          <FaUsers
            style={{ fontSize: "3rem", marginBottom: "1rem", color: "#42A5F5" }}
          />
          <div>No live artist events currently scheduled.</div>
          <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
            Check back soon for upcoming artist demonstrations!
          </div>
        </EmptyState>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {filteredEvents.map((event, index) => {
            // Find a matching picture for this event
            const matchingPicture = findMatchingEventPicture(event.eventName);
            const imageUrl = matchingPicture?.image
              ? urlFor(matchingPicture.image)?.width(800).height(600).url()
              : null;

            const IconComponent = getRandomIcon(index);
            const eventPast = isEventPast(event);

            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ClassCard
                  elevation={3}
                  isHovered={hoveredCard === index}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <EventBadge>
                    <FaEye />
                    Live Demo
                  </EventBadge>

                  <CardContent>
                    <TitleRow>
                      <TitleSection>
                        <EventTitle>
                          <EventIcon>
                            <IconComponent />
                          </EventIcon>
                          {event.eventName}
                        </EventTitle>
                      </TitleSection>
                    </TitleRow>

                    <ContentSection>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "1rem",
                        }}
                      >
                        <InfoGrid>
                          <InfoItem>
                            <InfoIcon>
                              <FaCalendarAlt />
                            </InfoIcon>
                            {getDateInfo(event)}
                          </InfoItem>
                          <InfoItem>
                            <InfoIcon>
                              <FaClock />
                            </InfoIcon>
                            {formatTime(event.time.startTime)} -{" "}
                            {formatTime(event.time.endTime)}
                          </InfoItem>
                        </InfoGrid>

                        {imageUrl && (
                          <ImageSection>
                            <StyledImage
                              src={imageUrl}
                              alt={event.eventName}
                              width={150}
                              height={100}
                            />
                          </ImageSection>
                        )}
                      </div>

                      <Description>{event.description}</Description>

                      {event.options.length > 0 && (
                        <OptionsContainer>
                          {event.options.map((option) => (
                            <OptionCategory key={option._id}>
                              <OptionLabel>{option.categoryName}:</OptionLabel>
                              <OptionChips>
                                {option.choices.map((choice) => (
                                  <Chip
                                    key={choice._id}
                                    label={choice.name}
                                    size="small"
                                    sx={{
                                      backgroundColor: "rgba(50,108,133,0.1)",
                                      color: "#326C85",
                                      fontWeight: "500",
                                      "&:hover": {
                                        backgroundColor: "rgba(50,108,133,0.2)",
                                      },
                                    }}
                                  />
                                ))}
                              </OptionChips>
                            </OptionCategory>
                          ))}
                        </OptionsContainer>
                      )}

                      <StatusBadge>
                        <FaEye />
                        {eventPast ? "Event Completed" : "Upcoming Live Demo"}
                      </StatusBadge>
                    </ContentSection>
                  </CardContent>
                </ClassCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </StyledContainer>
  );
}

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
import Link from "next/link";
import { motion } from "motion/react";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { client } from "@/sanity/client";
import {
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaPalette,
  FaUsers,
  FaGraduationCap,
} from "react-icons/fa";
import { GiPaintBrush, GiPaintRoller, GiMagicHat } from "react-icons/gi";

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
  price: number;
  numberOfParticipants?: number;
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
  fontFamily: "var(--font-eb-garamond)",
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
  color: "black",
  lineHeight: 1.6,
  fontWeight: "700",
});

const SectionTitle = styled("h2")({
  fontSize: "2rem",
  fontWeight: "700",
  marginBottom: "2rem",
  color: "#326C85",
  position: "relative",
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
  marginTop: "0", // Remove top margin since we're now next to the date/time
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
  paddingRight: "120px", // Add padding to prevent overlap with price tag
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
    width: "calc(100% - 120px)", // Adjust underline to account for padding
  },
  "@media (min-width: 768px)": {
    paddingRight: "140px", // Slightly more padding on larger screens
    "&:hover:after": {
      width: "calc(100% - 140px)",
    },
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

const PriceTag = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1.125rem",
  fontWeight: "bold",
  color: "white",
  background: "linear-gradient(135deg, #326C85, #4A90A4)",
  padding: "0.5rem 1rem",
  borderRadius: "20px",
  position: "absolute",
  top: "15px",
  right: "15px",
  boxShadow: "0 4px 15px rgba(50, 108, 133, 0.3)",
  zIndex: 3,
  transform: "rotate(-2deg)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "rotate(0deg) scale(1.05)",
    boxShadow: "0 6px 20px rgba(50, 108, 133, 0.4)",
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

const SignUpButton = styled("div")({
  display: "inline-block",
  padding: "0.75rem 1.5rem",
  background: "linear-gradient(135deg, #326C85, #42A5F5)",
  color: "white",
  borderRadius: "25px",
  textDecoration: "none",
  fontWeight: "700",
  transition: "all 0.3s ease",
  border: "2px solid transparent",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    transition: "left 0.5s ease",
  },
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(50, 108, 133, 0.3)",
    "&:before": {
      left: "100%",
    },
  },
  "&:active": {
    transform: "translateY(0)",
  },
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

export default function Classes() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventPictures, setEventPictures] = useState<SanityDocument[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [eventParticipantCounts, setEventParticipantCounts] = useState<
    Record<string, number>
  >({});

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

    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customer", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const responseText = await response.text();

        let result;
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error(
            "Failed to parse customer response as JSON:",
            parseError
          );
          return;
        }

        if (!response.ok) {
          console.error(
            "Failed to fetch customers:",
            result.error || "Unknown error"
          );
          return;
        }

        // Calculate participant counts per event
        const participantCounts: Record<string, number> = {};

        if (result.data && Array.isArray(result.data)) {
          result.data.forEach(
            (customer: { event?: { _id: string }; quantity: number }) => {
              const eventId = customer.event?._id;
              if (eventId) {
                // Add the quantity (number of participants) for this registration
                participantCounts[eventId] =
                  (participantCounts[eventId] || 0) + customer.quantity;
              }
            }
          );
        }
        setEventParticipantCounts(participantCounts);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchEvents();
    fetchCustomers();
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

  // Filter events to only show classes and workshops (exclude camps)
  const filteredEvents = events
    .filter((event) => {
      const eventType = event.eventType.toLowerCase();
      return eventType.includes("class") || eventType.includes("workshop");
    })
    .sort((a, b) => {
      // Sort by start date - closest events first
      const dateA = new Date(a.dates.startDate);
      const dateB = new Date(b.dates.startDate);
      return dateA.getTime() - dateB.getTime();
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

  const getRandomIcon = (index: number) => {
    const icons = [
      FaPalette,
      GiPaintBrush,
      GiPaintRoller,
      FaGraduationCap,
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
          <LoadingText>Loading creative classes... 🎨</LoadingText>
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
        Our Classes & Workshops
        <TitleIcon>
          <GiPaintBrush />
        </TitleIcon>
      </Title>

      <Subtitle>
        No matter your skill level, we&apos;ve got a class for you.
        <br />
        Let&apos;s get creative — together!
      </Subtitle>

      <SectionTitle>Upcoming Classes & Workshops</SectionTitle>

      {filteredEvents.length === 0 ? (
        <EmptyState>
          <FaUsers
            style={{ fontSize: "3rem", marginBottom: "1rem", color: "black" }}
          />
          <div>No classes or workshops currently scheduled.</div>
          <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
            Check back soon for new creative opportunities!
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
                  <PriceTag>
                    <FaDollarSign />
                    {event.price}
                  </PriceTag>

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
                          fontSize: "1rem",
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

                      {/* Show participant count only if signups > 5 */}
                      {(eventParticipantCounts[event._id] || 0) > 5 && (
                        <InfoItem style={{ marginBottom: "1rem" }}>
                          <InfoIcon>
                            <FaUsers />
                          </InfoIcon>
                          {eventParticipantCounts[event._id] || 0} /{" "}
                          {event.numberOfParticipants || 20} signed up
                        </InfoItem>
                      )}

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

                      {/* Check if event is sold out */}
                      {(eventParticipantCounts[event._id] || 0) >=
                      (event.numberOfParticipants || 20) ? (
                        <div
                          style={{
                            display: "inline-block",
                            padding: "0.75rem 1.5rem",
                            background:
                              "linear-gradient(135deg, #d32f2f, #f44336)",
                            color: "white",
                            borderRadius: "25px",
                            fontWeight: "700",
                            textAlign: "center",
                            cursor: "not-allowed",
                          }}
                        >
                          Sold Out
                        </div>
                      ) : (
                        <Link
                          href={`/calendar/${event._id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <SignUpButton>Sign Up for Class</SignUpButton>
                        </Link>
                      )}
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

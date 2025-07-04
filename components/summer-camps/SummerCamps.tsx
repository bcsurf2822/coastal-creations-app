"use client";

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { Box, Container, Paper, CircularProgress, Alert } from "@mui/material";
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import {
  FaCampground,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaSun,
  FaTree,
  FaMountain,
  FaUsers,
} from "react-icons/fa";
import {
  GiCampfire,
  GiForest,
  // GiTent,
  GiButterfly,
} from "react-icons/gi";

interface Event {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  price: number;
  numberOfParticipants?: number;
  dates: {
    startDate: string;
    endDate?: string;
    isRecurring: boolean;
    recurringPattern?: string;
    recurringEndDate?: string;
    excludeDates?: string[];
    specificDates?: string[];
  };
  time: {
    startTime: string;
    endTime?: string;
  };
  image?: string;
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
  marginBottom: "1rem",
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
  fontSize: "1.25rem",
  color: "#616161",
  lineHeight: 1.6,
  fontWeight: "500",
});

const GridContainer = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(1, 1fr)",
  gap: "2rem",
  "@media (min-width: 768px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  "@media (min-width: 1024px)": {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
});

interface CampCardProps {
  isHovered: boolean;
}

const CampCard = styled(Paper)<CampCardProps>(({ isHovered }) => ({
  borderRadius: "20px",
  overflow: "hidden",
  height: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  boxShadow: isHovered
    ? "0 20px 40px rgba(50, 108, 133, 0.25)"
    : "0 8px 24px rgba(66, 165, 245, 0.15)",
  transform: isHovered
    ? "translateY(-12px) scale(1.03) rotate(1deg)"
    : "translateY(0) scale(1) rotate(0deg)",
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
    zIndex: 1,
  },
}));

const ImageContainer = styled("div")({
  position: "relative",
  height: "200px",
  overflow: "hidden",
  flex: "0 0 auto", // Don't grow or shrink, fixed height
});

const StyledImage = styled(Image)({
  objectFit: "cover",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const CardContent = styled(Box)({
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto", // Take up remaining space
  position: "relative",
  zIndex: 2,
});

const ContentContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  justifyContent: "space-between",
});

const CampTitle = styled("h3")({
  fontSize: "1.5rem",
  fontWeight: "bold",
  margin: 0,
  color: "#326C85",
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  paddingRight: "6rem", // Add space for price tag
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
    width: "calc(100% - 6rem)", // Adjust underline to not go under price tag
  },
});

const CampIcon = styled("span")({
  fontSize: "1.25rem",
  color: "#42A5F5",
  animation: "wiggle 2s ease-in-out infinite",
  "@keyframes wiggle": {
    "0%, 100%": { transform: "rotate(0deg)" },
    "25%": { transform: "rotate(5deg)" },
    "75%": { transform: "rotate(-5deg)" },
  },
});

const Description = styled("p")({
  margin: "1rem 0 0 0", // Add top margin to separate from title
  color: "#616161",
  lineHeight: 1.6,
  textAlign: "justify",
  fontWeight: "700",
});

const InfoItem = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  background:
    "linear-gradient(135deg, rgba(50,108,133,0.08), rgba(66,165,245,0.08))",
  borderRadius: "15px",
  border: "1px solid rgba(50,108,133,0.15)",
  fontSize: "0.875rem",
  color: "#424242",
  fontWeight: "700",
});

const InfoIcon = styled("span")({
  color: "#42A5F5",
  fontSize: "1.1rem",
  minWidth: "1.1rem",
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

const RegisterButton = styled("div")({
  display: "inline-block",
  padding: "0.75rem 1.5rem",
  background: "linear-gradient(135deg, #326C85, #42A5F5)",
  color: "white",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "700",
  transition: "all 0.3s ease",
  border: "2px solid transparent",
  position: "relative",
  overflow: "hidden",
  textAlign: "center",
  cursor: "pointer",
  alignSelf: "flex-start", // Align to left side of container
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
});

const TopSection = styled("div")({
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto", // Grow to take available space
});

const BottomSection = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1rem",
  flex: "0 0 auto", // Fixed size, don't grow
});

const SummerCamps = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [eventParticipantCounts, setEventParticipantCounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();

        setEvents(data.events || []);
      } catch (err) {
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

  // Filter for camps and sort by closest date first
  const campEvents = events
    .filter((event) => event.eventType === "camp")
    .sort((a, b) => {
      // Sort by start date - closest events first
      const dateA = new Date(a.dates.startDate);
      const dateB = new Date(b.dates.startDate);
      return dateA.getTime() - dateB.getTime();
    });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getRandomIcon = (index: number) => {
    const icons = [GiCampfire, GiForest, GiButterfly, FaTree];
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
          <LoadingText>Loading summer adventures... 🏕️</LoadingText>
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
          {error}
        </Alert>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Title>
        <TitleIcon>
          <FaCampground />
        </TitleIcon>
        Summer Camps
        <TitleIcon>
          <FaSun />
        </TitleIcon>
      </Title>

      <Subtitle>Spend your Summer Creating at Coastal Creations!</Subtitle>

      {campEvents.length === 0 ? (
        <EmptyState>
          <FaMountain
            style={{ fontSize: "3rem", marginBottom: "1rem", color: "#42A5F5" }}
          />
          <div>No summer camps found.</div>
          <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
            Check back soon for exciting summer adventures!
          </div>
        </EmptyState>
      ) : (
        <GridContainer>
          {campEvents.map((event, index) => {
            const IconComponent = getRandomIcon(index);

            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <CampCard
                  elevation={3}
                  isHovered={hoveredCard === index}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <PriceTag>
                    <FaDollarSign />
                    {event.price ? event.price : "Free"}
                  </PriceTag>

                  {event.image && (
                    <ImageContainer>
                      <StyledImage
                        src={event.image}
                        alt={event.eventName}
                        fill
                      />
                    </ImageContainer>
                  )}

                  <CardContent>
                    <ContentContainer>
                      <TopSection>
                        <CampTitle>
                          <CampIcon>
                            <IconComponent />
                          </CampIcon>
                          {event.eventName}
                        </CampTitle>
                        <Description>{event.description}</Description>
                      </TopSection>

                      <BottomSection>
                        <InfoItem>
                          <InfoIcon>
                            <FaCalendarAlt />
                          </InfoIcon>
                          <span>
                            {formatDate(event.dates.startDate)}
                            {(event.dates.isRecurring
                              ? event.dates.recurringEndDate
                              : event.dates.endDate) &&
                              ` - ${formatDate(event.dates.isRecurring ? event.dates.recurringEndDate : event.dates.endDate)}`}
                          </span>
                        </InfoItem>
                        <InfoItem>
                          <InfoIcon>
                            <FaClock />
                          </InfoIcon>
                          <span>
                            {formatTime(event.time.startTime)}
                            {event.time.endTime &&
                              ` - ${formatTime(event.time.endTime)}`}
                          </span>
                        </InfoItem>
                        {/* Show participant count only if signups > 5 */}
                        {(eventParticipantCounts[event._id] || 0) > 5 && (
                          <InfoItem>
                            <InfoIcon>
                              <FaUsers />
                            </InfoIcon>
                            <span>
                              {eventParticipantCounts[event._id] || 0} /{" "}
                              {event.numberOfParticipants || 20} signed up
                            </span>
                          </InfoItem>
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
                              borderRadius: "8px",
                              textDecoration: "none",
                              fontWeight: "700",
                              textAlign: "center",
                              cursor: "not-allowed",
                              alignSelf: "flex-start",
                            }}
                          >
                            Sold Out
                          </div>
                        ) : (
                          <Link
                            href={`/calendar/${event._id}`}
                            style={{ textDecoration: "none" }}
                          >
                            <RegisterButton>Register</RegisterButton>
                          </Link>
                        )}
                      </BottomSection>
                    </ContentContainer>
                  </CardContent>
                </CampCard>
              </motion.div>
            );
          })}
        </GridContainer>
      )}
    </StyledContainer>
  );
};

export default SummerCamps;

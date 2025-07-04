"use client";

import { useState, useEffect, use } from "react";
import { parseISO, format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { client } from "@/sanity/client";
import styled from "@emotion/styled";
import {
  CardContent,
  Typography,
  Divider,
  Button,
  Paper,
  Chip,
  Container,
} from "@mui/material";
import { Description, Settings } from "@mui/icons-material";
import { motion } from "motion/react";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

interface EventOption {
  categoryName: string;
  categoryDescription: string;
  choices: {
    name: string;
    _id: string;
  }[];
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

interface EventTime {
  startTime: string;
  endTime: string;
  _id: string;
}

interface EventData {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  price: number;
  dates: EventDates;
  time: EventTime;
  options: EventOption[];
  createdAt: string;
  updatedAt: string;
}

// Setup Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

// Styled Components
const StyledContainer = styled(Container)({
  padding: "1rem",
  maxWidth: "800px",
  minHeight: "auto",
  fontFamily: "var(--font-eb-garamond)",
});

const EventCard = styled(Paper)({
  borderRadius: "18px",
  overflow: "hidden",
  position: "relative",
  background: "white",
  boxShadow: "0 8px 32px rgba(50, 108, 133, 0.12)",

  backgroundImage:
    "linear-gradient(white, white), linear-gradient(135deg, #326C85, #42A5F5, #64B5F6)",
  backgroundOrigin: "border-box",
  backgroundClip: "content-box, border-box",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 12px 40px rgba(50, 108, 133, 0.18)",
  },
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(135deg, rgba(50,108,133,0.02), rgba(66,165,245,0.02))",
    opacity: 1,
    transition: "all 0.4s ease",
    zIndex: 0,
  },
});

const CardContentStyled = styled(CardContent)({
  padding: 0,
  position: "relative",
  zIndex: 2,
  "&:last-child": {
    paddingBottom: 0,
  },
});

const ContentWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  "@media (min-width: 1024px)": {
    flexDirection: "row",
  },
});

const MainContent = styled("div")<{ hasImage?: boolean }>(({ hasImage }) => ({
  flex: hasImage ? "2" : "1",
  padding: "1.25rem",
  "@media (max-width: 1023px)": {
    padding: "1rem",
  },
}));

const ImageSection = styled("div")({
  flex: "1",
  padding: "1.25rem",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  "@media (max-width: 1023px)": {
    padding: "0 1rem 1rem",
  },
});

const EventTitle = styled("h1")({
  fontSize: "1.75rem",
  fontWeight: "700",
  color: "#326C85",
  marginBottom: "1.25rem",
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  "@media (max-width: 768px)": {
    fontSize: "1.5rem",
    flexDirection: "column",
    gap: "0.5rem",
    textAlign: "center",
  },
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-4px",
    left: "0",
    width: "40px",
    height: "3px",
    background: "linear-gradient(90deg, #326C85, #42A5F5)",
    borderRadius: "2px",
    "@media (max-width: 768px)": {
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
});

const TitleIcon = styled("span")({
  fontSize: "2rem",
  color: "#42A5F5",
  animation: "bounce 2s ease-in-out infinite",
  "@keyframes bounce": {
    "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
    "40%": { transform: "translateY(-8px)" },
    "60%": { transform: "translateY(-4px)" },
  },
});

const InfoSection = styled(Paper)({
  padding: "1rem",
  marginBottom: "1rem",
  borderRadius: "15px",
  background:
    "linear-gradient(135deg, rgba(50,108,133,0.05), rgba(66,165,245,0.05))",
  border: "2px solid rgba(50,108,133,0.1)",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 6px 20px rgba(50, 108, 133, 0.12)",
    border: "2px solid rgba(50,108,133,0.15)",
  },
});

const InfoItem = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginBottom: "0.75rem",
  "&:last-child": {
    marginBottom: 0,
  },
});

const InfoIcon = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #326C85, #42A5F5)",
  color: "white",
  fontSize: "1rem",
  flexShrink: 0,
  boxShadow: "0 3px 12px rgba(50, 108, 133, 0.25)",
});

const InfoText = styled(Typography)({
  fontWeight: "700",
  color: "#424242",
  fontSize: "0.9rem",
});

const PriceDisplay = styled("div")({
  fontSize: "1.25rem",
  fontWeight: "700",
  color: "#424242",
  marginBottom: "1.5rem",
  marginLeft: "1.5rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  "@media (max-width: 768px)": {
    justifyContent: "center",
  },
});

const OptionLabel = styled(Typography)({
  fontWeight: "700",
  color: "#326C85",
  fontSize: "0.9rem",
  marginBottom: "0.4rem",
});

const OptionDescription = styled(Typography)({
  color: "#666",
  fontSize: "0.8rem",
  marginBottom: "0.6rem",
  fontWeight: "700",
});

const OptionChips = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  marginLeft: "0.75rem",
});

const StyledChip = styled(Chip)({
  backgroundColor: "rgba(50,108,133,0.1)",
  color: "#326C85",
  fontWeight: "700",
  borderRadius: "12px",
  border: "1px solid rgba(50,108,133,0.2)",
  fontSize: "0.75rem",
  height: "24px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(50,108,133,0.2)",
    transform: "translateY(-1px)",
    boxShadow: "0 3px 6px rgba(50,108,133,0.15)",
  },
});

const RegisterButton = styled(Button)({
  padding: "0.75rem 2rem",
  fontSize: "1rem",
  fontWeight: "700",
  borderRadius: "20px",
  background: "linear-gradient(135deg, #326C85, #42A5F5)",
  color: "white",
  border: "none",
  position: "relative",
  overflow: "hidden",
  textTransform: "none",
  boxShadow: "0 6px 20px rgba(50, 108, 133, 0.25)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(135deg, #2a5a73, #1976d2)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(50, 108, 133, 0.35)",
  },
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
  "&:hover:before": {
    left: "100%",
  },
  "@media (max-width: 768px)": {
    width: "100%",
    padding: "0.75rem",
  },
});

const StyledImage = styled(Image)({
  borderRadius: "15px",
  objectFit: "cover",
  width: "100%",
  maxWidth: "300px",
  height: "250px",
  transition: "all 0.3s ease",
  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.18)",
  },
});

const LoadingContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "50vh",
  gap: "1rem",
});

const LoadingText = styled(Typography)({
  color: "#326C85",
  fontSize: "1.1rem",
  fontWeight: "700",
  animation: "colorChange 2s ease-in-out infinite",
  "@keyframes colorChange": {
    "0%, 100%": { color: "#326C85" },
    "50%": { color: "#42A5F5" },
  },
});

// Helper function to format time from 24-hour to 12-hour format
const formatTime = (time: string): string => {
  if (!time) return "Time unavailable";

  try {
    // Parse the time string (assuming format like "14:30" or "14:30:00")
    const [hours, minutes] = time.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      return time; // Return original if parsing fails
    }

    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, "0");

    return `${displayHours}:${displayMinutes} ${period}`;
  } catch {
    return time; // Return original if any error occurs
  }
};

export default function EventDetails({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // Unwrap params with React.use() as recommended by Next.js
  const unwrappedParams = use(params);
  const { eventId } = unwrappedParams;

  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventPictures, setEventPictures] = useState<SanityDocument[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/event/${eventId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          throw new Error(data.error || "Event not found");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchEventPictures = async () => {
      try {
        const response = await fetch("/api/eventPictures");
        if (!response.ok) {
          throw new Error("Failed to fetch event pictures");
        }
        const data = await response.json();
        setEventPictures(data);
      } catch {
        // Optionally handle error
      }
    };
    fetchEventPictures();
  }, []);

  // Show a Not Found page if an event is explicitly not found after loading
  if (!isLoading && (error === "Event not found" || !event)) {
    notFound();
  }

  if (isLoading) {
    return (
      <StyledContainer>
        <LoadingContainer>
          <LoadingText>Loading event details... ✨</LoadingText>
        </LoadingContainer>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {error}
          </Typography>
        </div>
      </StyledContainer>
    );
  }

  // At this point, we know event is not null due to the notFound check
  const eventData = event!;
  const formattedStartDate = eventData.dates?.startDate
    ? format(parseISO(eventData.dates.startDate), "EEEE, MMMM d, yyyy")
    : "Item unavailable";

  // Find a matching event picture for an event
  const findMatchingEventPicture = (eventName: string) => {
    if (!eventPictures || eventPictures.length === 0) return null;
    const eventNameLower = eventName.toLowerCase();
    return eventPictures.find((picture) => {
      if (!picture.title) return false;
      const titleLower = picture.title.toLowerCase();
      return titleLower === eventNameLower;
    });
  };

  // Find the matching image for this event
  const matchingPicture = findMatchingEventPicture(eventData.eventName);
  const imageUrl = matchingPicture?.image
    ? urlFor(matchingPicture.image)?.width(800).height(600).url()
    : null;

  return (
    <StyledContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <EventCard elevation={0}>
          {/* Floating Icons */}

          <CardContentStyled>
            <ContentWrapper>
              <MainContent hasImage={!!imageUrl}>
                <EventTitle>
                  <TitleIcon></TitleIcon>
                  {eventData.eventName || "Event Details"}
                </EventTitle>

                {/* Date & Time Section */}
                <InfoSection elevation={0}>
                  <InfoItem>
                    <InfoIcon>
                      <FaCalendarAlt />
                    </InfoIcon>
                    <InfoText>
                      {eventData.dates?.isRecurring &&
                      eventData.dates.recurringEndDate
                        ? `${(eventData.dates.recurringPattern || "weekly").charAt(0).toUpperCase() + (eventData.dates.recurringPattern || "weekly").slice(1)} ${format(parseISO(eventData.dates.startDate), "MMMM d, yyyy")} - ${format(parseISO(eventData.dates.recurringEndDate), "MMMM d, yyyy")}`
                        : formattedStartDate}
                    </InfoText>
                  </InfoItem>

                  <InfoItem>
                    <InfoIcon>
                      <FaClock />
                    </InfoIcon>
                    <InfoText>
                      {formatTime(eventData.time?.startTime || "")}
                      {eventData.time?.endTime &&
                        ` - ${formatTime(eventData.time.endTime)}`}
                    </InfoText>
                  </InfoItem>
                </InfoSection>

                {/* Description Section */}
                {eventData.description && (
                  <InfoSection elevation={0}>
                    <InfoItem style={{ alignItems: "flex-start" }}>
                      <InfoIcon>
                        <Description />
                      </InfoIcon>
                      <div style={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          style={{
                            whiteSpace: "pre-line",
                            lineHeight: 1.6,
                            fontWeight: "700",
                          }}
                        >
                          {eventData.description}
                        </Typography>
                      </div>
                    </InfoItem>
                  </InfoSection>
                )}

                {/* Options Section */}
                {eventData.options && eventData.options.length > 0 && (
                  <InfoSection elevation={0}>
                    <InfoItem style={{ alignItems: "flex-start" }}>
                      <InfoIcon>
                        <Settings />
                      </InfoIcon>
                      <div style={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          style={{
                            marginBottom: "0.75rem",
                            color: "#326C85",
                            fontWeight: "700",
                          }}
                        >
                          Available Options
                        </Typography>
                        <div>
                          {eventData.options.map((option, index) => (
                            <div
                              key={option._id}
                              style={{ marginBottom: "0.75rem" }}
                            >
                              <OptionLabel>{option.categoryName}</OptionLabel>
                              <OptionDescription>
                                {option.categoryDescription}
                              </OptionDescription>
                              <OptionChips>
                                {option.choices.map((choice) => (
                                  <StyledChip
                                    key={choice._id}
                                    label={choice.name}
                                    size="small"
                                  />
                                ))}
                              </OptionChips>
                              {index < eventData.options.length - 1 && (
                                <Divider style={{ margin: "0.75rem 0" }} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </InfoItem>
                  </InfoSection>
                )}

                {/* Price Display */}
                {eventData.price !== undefined && (
                  <PriceDisplay>${eventData.price} per person</PriceDisplay>
                )}

                {/* Registration Button */}
                <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                  <Link
                    href={`/payments?eventId=${encodeURIComponent(
                      eventData._id
                    )}&eventTitle=${encodeURIComponent(eventData.eventName)}${
                      eventData.price !== undefined
                        ? `&price=${encodeURIComponent(eventData.price)}`
                        : ""
                    }`}
                    style={{ textDecoration: "none" }}
                  >
                    <RegisterButton>Register for this Event</RegisterButton>
                  </Link>
                </div>
              </MainContent>

              {/* Image Section */}
              {imageUrl && (
                <ImageSection>
                  <motion.div
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <StyledImage
                      src={imageUrl}
                      alt={eventData.eventName}
                      width={300}
                      height={250}
                    />
                  </motion.div>
                </ImageSection>
              )}
            </ContentWrapper>
          </CardContentStyled>
        </EventCard>
      </motion.div>
    </StyledContainer>
  );
}

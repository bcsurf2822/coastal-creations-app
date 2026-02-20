"use client";

import React from "react";
import styled from "@emotion/styled";
import { Box, Chip } from "@mui/material";
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import { FaCalendarAlt, FaClock, FaUsers, FaInstagram } from "react-icons/fa";
import { IconType } from "react-icons";
import { Button } from "@/components/ui";

// Event interfaces
interface EventOption {
  categoryName: string;
  categoryDescription: string;
  choices: { name: string; _id: string }[];
  _id: string;
}

interface EventDates {
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
  excludeDates?: string[];
  specificDates?: string[];
  _id?: string;
}

interface EventTime {
  startTime: string;
  endTime: string;
  _id?: string;
}

export interface UniversalEventData {
  _id: string;
  eventName: string;
  eventType: string;
  description: string;
  isFree?: boolean;
  price?: number;
  numberOfParticipants?: number;
  dates: EventDates;
  time: EventTime;
  options?: EventOption[];
  image?: string;
  isDiscountAvailable?: boolean;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    minParticipants: number;
    name: string;
    description?: string;
  };
  instagramEmbedCode?: string;
}

export interface CardConfig {
  layout?: "horizontal" | "vertical";
  showPrice?: boolean;
  showSignupButton?: boolean;
  showParticipantCount?: boolean;
  showOptions?: boolean;
  showImage?: boolean;
  badge?: {
    text: string;
    icon?: IconType;
    background?: string;
  };
  buttonText?: string;
}

export interface UniversalEventCardProps {
  event: UniversalEventData;
  index: number;
  icon: IconType;
  imageUrl?: string | null;
  currentParticipants?: number;
  config?: CardConfig;
  baseUrl?: string;
}

// --- Styled Components ---

const CardWrapper = styled("div")<{ layout?: "horizontal" | "vertical" }>(
  ({ layout = "horizontal" }) => ({
    borderRadius: "16px",
    overflow: "hidden",
    height: layout === "vertical" ? "100%" : "auto",
    position: "relative",
    display: "flex",
    flexDirection: layout === "vertical" ? "column" : "row",
    backgroundColor: "white",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e7eb",
    transition: "box-shadow 0.2s ease",
    "&:hover": {
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
    },
  }),
);

const ImageContainer = styled("div")<{ layout?: "horizontal" | "vertical" }>(
  ({ layout = "horizontal" }) => ({
    position: "relative",
    height: layout === "vertical" ? "200px" : "auto",
    width: layout === "vertical" ? "100%" : "180px",
    overflow: "hidden",
    flex: layout === "vertical" ? "0 0 auto" : "0 0 180px",
    backgroundColor: "#f3f4f6",
    "@media (max-width: 600px)": {
      width: layout === "horizontal" ? "120px" : "100%",
      flex: layout === "horizontal" ? "0 0 120px" : "0 0 auto",
    },
    "@media (min-width: 601px)": {
      width: layout === "horizontal" ? "140px" : "100%",
      flex: layout === "horizontal" ? "0 0 140px" : "0 0 auto",
    },
    "@media (min-width: 768px)": {
      width: layout === "horizontal" ? "180px" : "100%",
      flex: layout === "horizontal" ? "0 0 180px" : "0 0 auto",
    },
  }),
);

const StyledImage = styled(Image, {
  shouldForwardProp: (prop) => prop !== "isPlaceholder",
})<{ isPlaceholder?: boolean }>(({ isPlaceholder }) => ({
  objectFit: "contain",
  borderRadius: "0",
  padding: isPlaceholder ? "1rem" : "0.5rem",
  backgroundColor: isPlaceholder ? "transparent" : "#f8fafc",
}));

const CardContent = styled(Box)<{ layout?: "horizontal" | "vertical" }>(
  ({ layout = "horizontal" }) => ({
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    position: "relative",
    zIndex: 2,
    justifyContent: layout === "vertical" ? "space-between" : "flex-start",
  }),
);

const EventTitle = styled("h3")({
  fontSize: "1.35rem",
  fontWeight: "700",
  marginBottom: "0.5rem",
  color: "#1e293b",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

const EventIcon = styled("span")({
  fontSize: "1.15rem",
  color: "#326C85",
});

const Price = styled("span")({
  fontSize: "1.1rem",
  fontWeight: "700",
  color: "#1e293b",
  whiteSpace: "nowrap",
});

const BadgeTag = styled("span")<{ background?: string }>(({ background }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  fontSize: "0.8rem",
  fontWeight: "600",
  color: "white",
  background: background || "#326C85",
  padding: "0.3rem 0.75rem",
  borderRadius: "6px",
  whiteSpace: "nowrap",
}));

const InfoGrid = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
  marginBottom: "0.75rem",
});

const InfoPill = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.3rem 0.6rem",
  backgroundColor: "#f0f9ff",
  borderRadius: "6px",
  border: "1px solid #e0f2fe",
  fontSize: "0.78rem",
  color: "#475569",
  fontWeight: "500",
  "& svg": {
    color: "#326C85",
    fontSize: "0.75rem",
  },
});

const Description = styled("p")({
  marginTop: "0.5rem",
  marginBottom: "0.75rem",
  color: "#4b5563",
  lineHeight: 1.65,
  flex: "1",
  textAlign: "left",
  fontWeight: "400",
  fontSize: "0.9rem",
});

const DiscountTag = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.3rem 0.7rem",
  backgroundColor: "#dcfce7",
  color: "#166534",
  borderRadius: "6px",
  border: "1px solid #bbf7d0",
  fontSize: "0.8rem",
  fontWeight: "600",
  marginBottom: "0.75rem",
  width: "fit-content",
});

const OptionsContainer = styled("div")({
  marginBottom: "0.75rem",
});

const OptionCategory = styled("div")({
  marginBottom: "0.5rem",
});

const OptionLabel = styled("span")({
  fontWeight: "600",
  color: "#326C85",
  fontSize: "0.85rem",
});

const OptionChips = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.25rem",
  marginTop: "0.25rem",
});

const InstagramLink = styled("a")({
  position: "absolute",
  bottom: "12px",
  right: "12px",
  fontSize: "1.25rem",
  color: "#E1306C",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s ease",
  zIndex: 3,
  "&:hover": {
    transform: "scale(1.1)",
  },
});

const PLACEHOLDER_IMAGE = "/assets/images/flowerPainting.jpeg";

const UniversalEventCard: React.FC<UniversalEventCardProps> = ({
  event,
  index,
  icon: IconComponent,
  imageUrl,
  currentParticipants = 0,
  config = {},
}) => {
  const {
    layout = "horizontal",
    showPrice = true,
    showSignupButton = true,
    showParticipantCount = true,
    showOptions = true,
    showImage = true,
    badge,
    buttonText = "Sign Up for Class",
  } = config;

  const isArtistEvent = event.eventType === "artist";
  const finalButtonText = isArtistEvent ? "Get More Information" : buttonText;

  const buildPaymentUrl = (): string => {
    const params = new URLSearchParams();
    params.set("eventId", event._id);
    params.set("eventTitle", event.eventName);
    if (event.isFree || event.price === 0) {
      params.set("price", "0");
      params.set("isFree", "true");
    } else if (event.price !== undefined) {
      params.set("price", String(event.price));
    }
    return `/payments?${params.toString()}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDateInfo = (): string => {
    const { dates } = event;
    if (dates.isRecurring && dates.recurringPattern && dates.recurringEndDate) {
      return `${formatDate(dates.startDate)} to ${formatDate(dates.recurringEndDate)} (${dates.recurringPattern})`;
    } else if (dates.endDate) {
      return `${formatDate(dates.startDate)} - ${formatDate(dates.endDate)}`;
    } else {
      return formatDate(dates.startDate);
    }
  };

  const isDiscountActive = (): boolean => {
    return !!(
      event.isDiscountAvailable &&
      event.discount &&
      currentParticipants >= event.discount.minParticipants
    );
  };

  const discountActive = isDiscountActive();
  const isSoldOut = currentParticipants >= (event.numberOfParticipants || 20);

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      key={event._id}
      variants={itemVariants}
      style={{ height: "100%" }}
    >
      <CardWrapper layout={layout}>
        {/* Image Section */}
        {showImage && (
          <ImageContainer layout={layout}>
            <StyledImage
              src={imageUrl || event.image || PLACEHOLDER_IMAGE}
              alt={event.eventName}
              fill
              isPlaceholder={!imageUrl && !event.image}
            />
          </ImageContainer>
        )}

        <CardContent layout={layout}>
          <div>
            {/* Title row with price/badge */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <EventTitle>
                <EventIcon>
                  <IconComponent />
                </EventIcon>
                {event.eventName}
              </EventTitle>
              {badge ? (
                <BadgeTag background={badge.background}>
                  {badge.icon && <badge.icon />}
                  {badge.text}
                </BadgeTag>
              ) : showPrice && !isArtistEvent ? (
                event.isFree || event.price === 0 ? (
                  <Price style={{ color: "#16a34a" }}>Free</Price>
                ) : event.price !== undefined ? (
                  <Price>${event.price}</Price>
                ) : null
              ) : null}
            </div>

            <Description>{event.description}</Description>

            {/* Discount Badge */}
            {discountActive &&
              (event.discount?.name || event.discount?.description) && (
                <DiscountTag>
                  {event.discount.name || event.discount.description}
                </DiscountTag>
              )}

            {/* Potential Discount Info */}
            {event.isDiscountAvailable &&
              !discountActive &&
              event.discount &&
              (event.discount.name || event.discount.description) && (
                <DiscountTag>
                  Discount Available:{" "}
                  {event.discount.name || event.discount.description}
                </DiscountTag>
              )}

            {/* Options */}
            {showOptions && event.options && event.options.length > 0 && (
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
                            backgroundColor: "#f0f9ff",
                            color: "#475569",
                            fontWeight: "500",
                            border: "1px solid #e0f2fe",
                            "&:hover": {
                              backgroundColor: "#e0f2fe",
                            },
                          }}
                        />
                      ))}
                    </OptionChips>
                  </OptionCategory>
                ))}
              </OptionsContainer>
            )}
          </div>

          {/* Bottom row: info pills left, button right */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "1rem",
              marginTop: "auto",
            }}
          >
            <InfoGrid style={{ marginBottom: 0 }}>
              <InfoPill>
                <FaCalendarAlt />
                {getDateInfo()}
              </InfoPill>
              <InfoPill>
                <FaClock />
                {formatTime(event.time.startTime)} -{" "}
                {formatTime(event.time.endTime)}
              </InfoPill>

              {showParticipantCount && currentParticipants > 5 && (
                <InfoPill>
                  <FaUsers />
                  {currentParticipants} / {event.numberOfParticipants || 20}{" "}
                  signed up
                </InfoPill>
              )}
            </InfoGrid>

            {showSignupButton &&
              (isSoldOut ? (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled
                  style={{ flexShrink: 0, cursor: "not-allowed" }}
                >
                  Sold Out
                </Button>
              ) : (
                <Link
                  href={
                    isArtistEvent
                      ? `/events/live-artist/${event._id}`
                      : buildPaymentUrl()
                  }
                  style={{ textDecoration: "none", flexShrink: 0 }}
                >
                  <Button variant="primary" size="sm">
                    {finalButtonText}
                  </Button>
                </Link>
              ))}
          </div>
        </CardContent>

        {/* Instagram Icon */}
        {event.instagramEmbedCode && event.instagramEmbedCode.trim() && (
          <InstagramLink
            href={event.instagramEmbedCode}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </InstagramLink>
        )}
      </CardWrapper>
    </motion.div>
  );
};

export default UniversalEventCard;

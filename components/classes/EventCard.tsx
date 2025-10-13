"use client";

import React, { useState } from "react";
import styled from "@emotion/styled";
import { Box, Paper, Chip } from "@mui/material";
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaUsers,
  FaInstagram,
} from "react-icons/fa";
import { IconType } from "react-icons";
// import InstagramPostPreview from "@/components/shared/InstagramPostPreview";

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
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  icon: IconType;
  imageUrl?: string | null;
  currentParticipants?: number;
  config?: CardConfig;
}

interface CardStyledProps {
  isHovered: boolean;
  layout?: "horizontal" | "vertical";
}

const Card = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isHovered" && prop !== "layout",
})<CardStyledProps>(({ isHovered, layout = "horizontal" }) => ({
  borderRadius: "20px",
  overflow: "hidden",
  height: layout === "vertical" ? "100%" : "auto",
  position: "relative",
  display: "flex",
  flexDirection: layout === "vertical" ? "column" : "row",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  boxShadow: isHovered
    ? "0 20px 40px rgba(50, 108, 133, 0.25)"
    : "0 8px 24px rgba(66, 165, 245, 0.15)",
  transform: isHovered
    ? layout === "vertical"
      ? "translateY(-12px) scale(1.03) rotate(1deg)"
      : "translateY(-8px) scale(1.02)"
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
    zIndex: 0,
  },
}));

const ImageContainer = styled("div")<{ layout?: "horizontal" | "vertical" }>(
  ({ layout = "horizontal" }) => ({
    position: "relative",
    height: layout === "vertical" ? "200px" : "auto",
    width: layout === "vertical" ? "100%" : "180px",
    overflow: "hidden",
    flex: layout === "vertical" ? "0 0 auto" : "0 0 180px",
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
  })
);

const StyledImage = styled(Image)({
  objectFit: "cover",
  transition: "all 0.3s ease",
  borderRadius: "12px",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const CardContent = styled(Box)<{ layout?: "horizontal" | "vertical" }>(
  ({ layout = "horizontal" }) => ({
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    position: "relative",
    zIndex: 2,
    justifyContent: layout === "vertical" ? "space-between" : "flex-start",
  })
);

const EventTitle = styled("h3")({
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: "0.75rem",
  color: "#326C85",
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  paddingRight: "120px",
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
    width: "calc(100% - 120px)",
  },
  "@media (min-width: 768px)": {
    paddingRight: "140px",
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
  marginBottom: "1rem",
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

const PriceTag = styled("div")<{ background?: string }>(({ background }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1.125rem",
  fontWeight: "bold",
  color: "white",
  background: background || "linear-gradient(135deg, #326C85, #4A90A4)",
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
}));

const Badge = styled("div")<{ background?: string }>(({ background }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1rem",
  fontWeight: "bold",
  color: "white",
  background: background || "linear-gradient(135deg, #FF6B6B, #FF8E53)",
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
}));

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

const ActionButton = styled("div")({
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
  textAlign: "center",
  cursor: "pointer",
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

const DiscountBadge = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 1rem",
  background: "linear-gradient(135deg, #4caf50, #66bb6a)",
  color: "black",
  borderRadius: "15px",
  fontSize: "0.875rem",
  fontWeight: "700",
  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
  marginBottom: "1rem",
});

const OriginalPrice = styled("span")({
  textDecoration: "line-through",
  color: "#888",
  fontSize: "0.875rem",
  marginRight: "0.5rem",
});

// const InstagramThumbnailWrapper = styled("div")({
//   position: "absolute",
//   bottom: "10px",
//   right: "10px",
//   zIndex: 5,
// });

// const InstagramThumbnail = styled("div")({
//   width: "40px",
//   height: "40px",
//   borderRadius: "50%",
//   background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   cursor: "pointer",
//   boxShadow: "0 4px 12px rgba(225, 48, 108, 0.4)",
//   transition: "all 0.3s ease",
//   "&:hover": {
//     transform: "scale(1.15)",
//     boxShadow: "0 6px 18px rgba(225, 48, 108, 0.6)",
//   },
// });

// const InstagramIcon = styled("div")({
//   color: "white",
//   fontSize: "1.25rem",
//   filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
// });

// const InstagramPreviewOverlay = styled("div", {
//   shouldForwardProp: (prop) => prop !== "show",
// })<{ show: boolean }>(({ show }) => ({
//   position: "fixed",
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   backgroundColor: "rgba(0, 0, 0, 0.85)",
//   display: show ? "flex" : "none",
//   alignItems: "center",
//   justifyContent: "center",
//   zIndex: 9999,
//   padding: "2rem",
//   animation: show ? "fadeIn 0.3s ease" : "none",
//   "@keyframes fadeIn": {
//     from: { opacity: 0 },
//     to: { opacity: 1 },
//   },
// }));

// const InstagramPreviewContent = styled("div")({
//   maxWidth: "540px",
//   width: "100%",
//   maxHeight: "90vh",
//   overflowY: "auto",
//   position: "relative",
//   animation: "slideIn 0.3s ease",
//   "@keyframes slideIn": {
//     from: {
//       transform: "scale(0.8)",
//       opacity: 0,
//     },
//     to: {
//       transform: "scale(1)",
//       opacity: 1,
//     },
//   },
// });

// const CloseButton = styled("button")({
//   position: "absolute",
//   top: "-50px",
//   right: "0",
//   background: "white",
//   border: "none",
//   borderRadius: "50%",
//   width: "40px",
//   height: "40px",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   cursor: "pointer",
//   fontSize: "1.5rem",
//   color: "#326C85",
//   transition: "all 0.3s ease",
//   fontWeight: "bold",
//   "&:hover": {
//     background: "#326C85",
//     color: "white",
//     transform: "rotate(90deg)",
//   },
// });

const UniversalEventCard: React.FC<UniversalEventCardProps> = ({
  event,
  index,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  icon: IconComponent,
  imageUrl,
  currentParticipants = 0,
  config = {},
}) => {
  const [showInstagramPreview, setShowInstagramPreview] =
    useState<boolean>(false);

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

  const calculateDiscountedPrice = (): number => {
    if (!event.isDiscountAvailable || !event.discount || !event.price)
      return event.price || 0;
    if (currentParticipants < event.discount.minParticipants)
      return event.price;

    if (event.discount.type === "percentage") {
      return event.price - (event.price * event.discount.value) / 100;
    } else {
      return event.price - event.discount.value;
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
  const displayPrice = calculateDiscountedPrice();
  const isSoldOut = currentParticipants >= (event.numberOfParticipants || 20);

  return (
    <motion.div
      key={event._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        elevation={3}
        isHovered={isHovered}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        layout={layout}
      >
        {/* Badge or Price Tag */}
        {badge ? (
          <Badge background={badge.background}>
            {badge.icon && <badge.icon />}
            {badge.text}
          </Badge>
        ) : showPrice && event.price !== undefined ? (
          <PriceTag>
            <FaDollarSign />
            {discountActive ? (
              <>
                <OriginalPrice>${event.price}</OriginalPrice>$
                {displayPrice.toFixed(2)}
              </>
            ) : (
              `$${event.price}`
            )}
          </PriceTag>
        ) : null}

        {/* Image Section */}
        {showImage && (imageUrl || event.image) && (
          <ImageContainer layout={layout}>
            <StyledImage
              src={imageUrl || event.image || ""}
              alt={event.eventName}
              fill
            />
            {/* Instagram Thumbnail on Image */}
            {/* {event.instagramEmbedCode && (
              <InstagramThumbnailWrapper>
                <InstagramThumbnail
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInstagramPreview(true);
                  }}
                  title="View Instagram post"
                >
                  <InstagramIcon>
                    <FaInstagram />
                  </InstagramIcon>
                </InstagramThumbnail>
              </InstagramThumbnailWrapper>
            )} */}
          </ImageContainer>
        )}

        {/* Instagram Thumbnail when no image */}
        {/* {!showImage || (!imageUrl && !event.image) && event.instagramEmbedCode && (
          <div style={{ position: "absolute", top: "70px", right: "15px", zIndex: 4 }}>
            <InstagramThumbnail
              onClick={(e) => {
                e.stopPropagation();
                setShowInstagramPreview(true);
              }}
              title="View Instagram post"
            >
              <InstagramIcon>
                <FaInstagram />
              </InstagramIcon>
            </InstagramThumbnail>
          </div>
        )} */}

        <CardContent layout={layout}>
          <div>
            <EventTitle>
              <EventIcon>
                <IconComponent />
              </EventIcon>
              {event.eventName}
            </EventTitle>

            <Description>{event.description}</Description>

            {/* Discount Badge */}
            {discountActive &&
              (event.discount?.name || event.discount?.description) && (
                <DiscountBadge>
                  {event.discount.name || event.discount.description}
                </DiscountBadge>
              )}

            {/* Potential Discount Info */}
            {event.isDiscountAvailable &&
              !discountActive &&
              event.discount &&
              (event.discount.name || event.discount.description) && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    background: "linear-gradient(135deg, #81c784, #a5d6a7)",
                    color: "black",
                    borderRadius: "15px",
                    fontSize: "0.875rem",
                    fontWeight: "700",
                    boxShadow: "0 2px 8px rgba(129, 199, 132, 0.3)",
                    marginBottom: "1rem",
                    width: "fit-content",
                    maxWidth: "50%",
                  }}
                >
                  Discount Available:{" "}
                  {event.discount.name || event.discount.description}
                </div>
              )}

            <InfoGrid>
              <InfoItem>
                <InfoIcon>
                  <FaCalendarAlt />
                </InfoIcon>
                {getDateInfo()}
              </InfoItem>
              <InfoItem>
                <InfoIcon>
                  <FaClock />
                </InfoIcon>
                {formatTime(event.time.startTime)} -{" "}
                {formatTime(event.time.endTime)}
              </InfoItem>

              {/* Participant Count */}
              {showParticipantCount && currentParticipants > 5 && (
                <InfoItem>
                  <InfoIcon>
                    <FaUsers />
                  </InfoIcon>
                  {currentParticipants} / {event.numberOfParticipants || 20}{" "}
                  signed up
                </InfoItem>
              )}
            </InfoGrid>

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
          </div>

          {/* Action Button */}
          {showSignupButton &&
            (isSoldOut ? (
              <div
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #d32f2f, #f44336)",
                  color: "white",
                  borderRadius: "25px",
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
                style={{ textDecoration: "none", alignSelf: "flex-start" }}
              >
                <ActionButton>{buttonText}</ActionButton>
              </Link>
            ))}
        </CardContent>
      </Card>

      {/* Instagram Preview Modal */}
      {/* {event.instagramEmbedCode && (
        <InstagramPreviewOverlay
          show={showInstagramPreview}
          onClick={() => setShowInstagramPreview(false)}
        >
          <InstagramPreviewContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowInstagramPreview(false)}>
              ✕
            </CloseButton>
            <InstagramPostPreview embedCode={event.instagramEmbedCode} />
          </InstagramPreviewContent>
        </InstagramPreviewOverlay>
      )} */}
    </motion.div>
  );
};

export default UniversalEventCard;

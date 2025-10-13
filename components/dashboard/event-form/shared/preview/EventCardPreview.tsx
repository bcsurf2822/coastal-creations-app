"use client";

import { ReactElement, useState } from "react";
import styled from "@emotion/styled";
import { Box, Paper, Chip } from "@mui/material";
import { motion } from "motion/react";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaPalette,
  FaUsers,
  FaGraduationCap,
  // FaInstagram,
} from "react-icons/fa";
import { GiPaintBrush, GiPaintRoller, GiMagicHat } from "react-icons/gi";
import { EventFormState } from "../types/eventForm.types";
// import InstagramPostPreview from "@/components/shared/InstagramPostPreview";

interface EventCardPreviewProps {
  formData: EventFormState;
  imagePreviewUrl?: string;
}

// Styled Components (reused from Classes.tsx)
interface ClassCardProps {
  isHovered: boolean;
}

const ClassCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isHovered",
})<ClassCardProps>(({ isHovered }) => ({
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
  minWidth: 0,
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

const PreviewContainer = styled("div")({
  padding: "2rem",
  background: "#f8f9fa",
  borderRadius: "12px",
  border: "2px solid #e9ecef",
});

const PreviewTitle = styled("h3")({
  fontSize: "1.25rem",
  fontWeight: "bold",
  marginBottom: "1rem",
  color: "#326C85",
  textAlign: "center",
});

// const InstagramThumbnail = styled("div")({
//   width: "150px",
//   height: "150px",
//   borderRadius: "12px",
//   cursor: "pointer",
//   position: "relative",
//   border: "2px solid #E1306C",
//   background:
//     "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
//   transition: "all 0.3s ease",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   flexDirection: "column",
//   gap: "0.5rem",
//   color: "white",
//   "&:hover": {
//     transform: "scale(1.05)",
//     boxShadow: "0 8px 24px rgba(225, 48, 108, 0.4)",
//   },
// });

// const InstagramIcon = styled("div")({
//   fontSize: "3rem",
//   filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
// });

// const InstagramText = styled("div")({
//   fontSize: "0.75rem",
//   fontWeight: "600",
//   textAlign: "center",
//   textShadow: "0 1px 2px rgba(0,0,0,0.3)",
// });

// const InstagramPreviewOverlay = styled("div", {
//   shouldForwardProp: (prop) => prop !== "show",
// })<{ show: boolean }>(({ show }) => ({
//   position: "fixed",
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   backgroundColor: "rgba(0, 0, 0, 0.8)",
//   display: show ? "flex" : "none",
//   alignItems: "center",
//   justifyContent: "center",
//   zIndex: 9999,
//   padding: "2rem",
//   animation: show ? "fadeIn 0.3s ease" : "fadeOut 0.3s ease",
//   "@keyframes fadeIn": {
//     from: { opacity: 0 },
//     to: { opacity: 1 },
//   },
//   "@keyframes fadeOut": {
//     from: { opacity: 1 },
//     to: { opacity: 0 },
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
//   top: "-40px",
//   right: "0",
//   background: "white",
//   border: "none",
//   borderRadius: "50%",
//   width: "32px",
//   height: "32px",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   cursor: "pointer",
//   fontSize: "1.25rem",
//   color: "#326C85",
//   transition: "all 0.3s ease",
//   "&:hover": {
//     background: "#326C85",
//     color: "white",
//     transform: "rotate(90deg)",
//   },
// });


const EventCardPreview = ({
  formData,
  imagePreviewUrl,
}: EventCardPreviewProps): ReactElement => {
  const [hoveredCard, setHoveredCard] = useState<boolean>(false);
  // const [showInstagramPreview, setShowInstagramPreview] =
  //   useState<boolean>(false);

  // Helper functions
  const getRandomIcon = () => {
    const icons = [
      FaPalette,
      GiPaintBrush,
      GiPaintRoller,
      FaGraduationCap,
      GiMagicHat,
    ];
    return icons[0]; // Always use first icon for consistency in preview
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: unknown): string => {
    if (!time) return "TBD";

    // Handle Dayjs object
    if (
      time &&
      typeof time === "object" &&
      "format" in time &&
      typeof time.format === "function"
    ) {
      return time.format("h:mm A");
    }

    // Handle string format
    if (typeof time === "string") {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    }

    return "TBD";
  };

  const getDateInfo = (): string => {
    if (
      formData.isRecurring &&
      formData.recurringPattern &&
      formData.recurringEndDate
    ) {
      return `${formatDate(formData.startDate)} to ${formatDate(formData.recurringEndDate)} (${formData.recurringPattern})`;
    } else {
      return formatDate(formData.startDate);
    }
  };

  const calculateDiscountedPrice = (): number => {
    if (!formData.isDiscountAvailable || !formData.discount || !formData.price)
      return formData.price || 0;
    if (formData.discount.type === "percentage") {
      return formData.price - (formData.price * formData.discount.value) / 100;
    } else {
      return formData.price - formData.discount.value;
    }
  };

  const IconComponent = getRandomIcon();
  const displayPrice = calculateDiscountedPrice();
  const hasDiscount = formData.isDiscountAvailable && formData.discount;

  return (
    <PreviewContainer>
      <PreviewTitle>Card Preview</PreviewTitle>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ClassCard
          elevation={3}
          isHovered={hoveredCard}
          onMouseEnter={() => setHoveredCard(true)}
          onMouseLeave={() => setHoveredCard(false)}
        >
          <PriceTag>
            <FaDollarSign />
            {hasDiscount && formData.price ? (
              <>
                <OriginalPrice>${formData.price}</OriginalPrice>$
                {displayPrice.toFixed(2)}
              </>
            ) : (
              `$${formData.price || 0}`
            )}
          </PriceTag>

          <CardContent>
            <TitleRow>
              <TitleSection>
                <EventTitle>
                  <EventIcon>
                    <IconComponent />
                  </EventIcon>
                  {formData.eventName || "Event Name"}
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
                    {getDateInfo()}
                  </InfoItem>
                  <InfoItem>
                    <InfoIcon>
                      <FaClock />
                    </InfoIcon>
                    {formatTime(formData.startTime)} -{" "}
                    {formatTime(formData.endTime)}
                  </InfoItem>
                </InfoGrid>

                {imagePreviewUrl ? (
                  <ImageSection>
                    <StyledImage
                      src={imagePreviewUrl}
                      alt={formData.eventName || "Event preview"}
                      width={150}
                      height={100}
                    />
                  </ImageSection>
                ) : (
                  <ImageSection>
                    <div
                      style={{
                        width: "100%",
                        height: "135px",
                        background: "linear-gradient(135deg, #f0f0f0, #e0e0e0)",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                      }}
                    >
                      No image uploaded
                    </div>
                  </ImageSection>
                )}
              </div>

              <Description>
                {formData.description ||
                  "Event description will appear here..."}
              </Description>

              {/* Instagram Post Thumbnail */}
              {/* {formData.instagramEmbedCode && (
                <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                  <InstagramThumbnail
                    onClick={() => setShowInstagramPreview(true)}
                    title="Click to preview Instagram post"
                  >
                    <InstagramIcon>
                      <FaInstagram />
                    </InstagramIcon>
                    <InstagramText>
                      Instagram Post
                      <br />
                      Click to Preview
                    </InstagramText>
                  </InstagramThumbnail>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#666",
                      marginTop: "0.5rem",
                    }}
                  >
                    Instagram embed added!
                  </p>
                </div>
              )} */}
              {hasDiscount &&
                (formData.discount?.name || formData.discount?.description) && (
                  <DiscountBadge>
                    {formData.discount.name || formData.discount.description}
                  </DiscountBadge>
                )}
              {formData.numberOfParticipants && (
                <InfoItem style={{ marginBottom: "1rem" }}>
                  <InfoIcon>
                    <FaUsers />
                  </InfoIcon>
                  0 / {formData.numberOfParticipants} signed up
                </InfoItem>
              )}

              {formData.hasOptions && formData.optionCategories.length > 0 && (
                <OptionsContainer>
                  {formData.optionCategories.map((option, index) => (
                    <OptionCategory key={index}>
                      <OptionLabel>
                        {option.categoryName || "Category"}:
                      </OptionLabel>
                      <OptionChips>
                        {option.choices.map((choice, choiceIndex) => (
                          <Chip
                            key={choiceIndex}
                            label={choice.name || "Option"}
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

              <SignUpButton>Sign Up for Class</SignUpButton>
            </ContentSection>
          </CardContent>
        </ClassCard>
      </motion.div>

      {/* Instagram Preview Modal */}
      {/* {formData.instagramEmbedCode && (
        <InstagramPreviewOverlay
          show={showInstagramPreview}
          onClick={() => setShowInstagramPreview(false)}
        >
          <InstagramPreviewContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowInstagramPreview(false)}>
              ✕
            </CloseButton>
            <InstagramPostPreview embedCode={formData.instagramEmbedCode} />
          </InstagramPreviewContent>
        </InstagramPreviewOverlay>
      )} */}
    </PreviewContainer>
  );
};

export default EventCardPreview;

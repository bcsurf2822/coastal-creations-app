"use client";

import { ReactElement } from "react";
import styled from "@emotion/styled";
import { Chip } from "@mui/material";
import Image from "next/image";
import { FaCalendarAlt, FaClock, FaUsers, FaPalette } from "react-icons/fa";
import { Button } from "@/components/ui";
import { EventFormState } from "../types/eventForm.types";

interface EventCardPreviewProps {
  formData: EventFormState;
  imagePreviewUrl?: string;
}

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

const CardWrapper = styled("div")({
  borderRadius: "16px",
  overflow: "hidden",
  position: "relative",
  display: "flex",
  flexDirection: "row",
  backgroundColor: "white",
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
  border: "1px solid #e5e7eb",
});

const ImageContainer = styled("div")({
  position: "relative",
  width: "180px",
  flexShrink: 0,
  backgroundColor: "#f3f4f6",
  "@media (max-width: 600px)": {
    width: "120px",
  },
});

const StyledImage = styled(Image)({
  objectFit: "contain",
  padding: "0.5rem",
  backgroundColor: "#f8fafc",
});

const CardContent = styled("div")({
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
});

const EventTitleRow = styled("div")({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.75rem",
});

const EventName = styled("h3")({
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

const InfoGrid = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.4rem",
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

const PlaceholderImage = styled("div")({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#999",
  fontSize: "0.875rem",
  fontWeight: "500",
});

/**
 * EventCardPreview - mirrors UniversalEventCard layout for admin form preview.
 */
const EventCardPreview = ({
  formData,
  imagePreviewUrl,
}: EventCardPreviewProps): ReactElement => {
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
    if (
      time &&
      typeof time === "object" &&
      "format" in time &&
      typeof time.format === "function"
    ) {
      return time.format("h:mm A");
    }
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
    if (formData.isRecurring && formData.recurringPattern && formData.recurringEndDate) {
      return `${formatDate(formData.startDate)} to ${formatDate(formData.recurringEndDate)} (${formData.recurringPattern})`;
    }
    return formatDate(formData.startDate);
  };

  const hasDiscount = formData.isDiscountAvailable && formData.discount;

  return (
    <PreviewContainer>
      <PreviewTitle>Card Preview</PreviewTitle>

      <CardWrapper>
        <ImageContainer>
          {imagePreviewUrl ? (
            <StyledImage
              src={imagePreviewUrl}
              alt={formData.eventName || "Event preview"}
              fill
            />
          ) : (
            <PlaceholderImage>No image uploaded</PlaceholderImage>
          )}
        </ImageContainer>

        <CardContent>
          <div>
            <EventTitleRow>
              <EventName>
                <EventIcon>
                  <FaPalette />
                </EventIcon>
                {formData.eventName || "Event Name"}
              </EventName>
              {formData.isFree || formData.price === 0 ? (
                <Price style={{ color: "#16a34a" }}>Free</Price>
              ) : formData.price !== undefined ? (
                <Price>${formData.price}</Price>
              ) : null}
            </EventTitleRow>

            <Description>
              {formData.description || "Event description will appear here..."}
            </Description>

            {hasDiscount &&
              (formData.discount?.name || formData.discount?.description) && (
                <DiscountTag>
                  {formData.discount.name || formData.discount.description}
                </DiscountTag>
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

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "1rem",
              marginTop: "auto",
            }}
          >
            <InfoGrid>
              <InfoPill>
                <FaCalendarAlt />
                {getDateInfo()}
              </InfoPill>
              <InfoPill>
                <FaClock />
                {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
              </InfoPill>
              {formData.numberOfParticipants && (
                <InfoPill>
                  <FaUsers />
                  0 / {formData.numberOfParticipants} signed up
                </InfoPill>
              )}
            </InfoGrid>

            <Button
              variant="primary"
              size="sm"
              style={{ flexShrink: 0, pointerEvents: "none" }}
            >
              Sign Up for Class
            </Button>
          </div>
        </CardContent>
      </CardWrapper>
    </PreviewContainer>
  );
};

export default EventCardPreview;

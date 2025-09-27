"use client";

import { ReactElement, useState } from "react";
import styled from "@emotion/styled";
import { Box, Paper } from "@mui/material";
import { motion } from "motion/react";
import Image from "next/image";
import { FaBirthdayCake, FaGift, FaStar, FaHeart } from "react-icons/fa";
import {
  GiBalloons,
  GiPartyPopper,
  GiCupcake,
  GiPartyHat,
} from "react-icons/gi";
import { PrivateEventFormState } from "../types/privateEventForm.types";

interface PrivateEventCardPreviewProps {
  formData: PrivateEventFormState;
  imagePreviewUrl?: string;
  uploadedImageUrl?: string;
}

// Styled Components (reused from PrivateEvents.tsx)
const PriceTag = styled("div")({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "1.25rem",
  fontWeight: "bold",
  color: "white",
  background: "linear-gradient(135deg, #326C85, #4A90A4)",
  padding: "0.75rem 1.25rem",
  borderRadius: "25px 0 25px 0",
  position: "absolute",
  top: "-10px",
  left: "-10px",
  boxShadow: "0 4px 15px rgba(50, 108, 133, 0.3)",
  zIndex: 1,
  transform: "rotate(-2deg)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "rotate(0deg) scale(1.05)",
    boxShadow: "0 6px 20px rgba(50, 108, 133, 0.4)",
  },
});

const FloatingIcon = styled("div")<{ delay: number }>(({ delay }) => ({
  position: "absolute",
  fontSize: "1.5rem",
  color: "#42A5F5",
  opacity: 0.7,
  animation: `float 3s ease-in-out infinite ${delay}s`,
  "@keyframes float": {
    "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
    "50%": { transform: "translateY(-15px) rotate(10deg)" },
  },
}));

interface PartyCardProps {
  isHovered: boolean;
}

const PartyCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isHovered",
})<PartyCardProps>(({ isHovered }) => ({
  borderRadius: "20px",
  overflow: "hidden",
  height: "100%",
  position: "relative",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  boxShadow: isHovered
    ? "0 20px 40px rgba(25, 118, 210, 0.3)"
    : "0 8px 24px rgba(66, 165, 245, 0.15)",
  transform: isHovered
    ? "translateY(-15px) scale(1.02) rotate(1deg)"
    : "translateY(0) scale(1) rotate(0deg)",
  border: "3px solid transparent",
  background: isHovered
    ? "linear-gradient(white, white) padding-box, linear-gradient(135deg, #1976D2, #42A5F5, #64B5F6) border-box"
    : "white",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: isHovered
      ? "linear-gradient(135deg, rgba(25,118,210,0.05), rgba(66,165,245,0.05))"
      : "transparent",
    opacity: 1,
    transition: "all 0.4s ease",
    zIndex: 0,
  },
}));

const CardContent = styled(Box)({
  padding: "2.5rem",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  zIndex: 2,
  position: "relative",
});

const PartyTitle = styled("h2")({
  fontSize: "1.75rem",
  fontWeight: "700",
  marginBottom: "0.5rem",
  color: "#326C85",
  marginTop: "1.5rem",
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
    background: "linear-gradient(90deg, #1976D2, #42A5F5)",
    transition: "width 0.3s ease",
    borderRadius: "2px",
  },
  "&:hover:after": {
    width: "100%",
  },
});

const TitleIconSmall = styled("span")({
  fontSize: "1.5rem",
  color: "#42A5F5",
  animation: "wiggle 2s ease-in-out infinite",
  "@keyframes wiggle": {
    "0%, 100%": { transform: "rotate(0deg)" },
    "25%": { transform: "rotate(5deg)" },
    "75%": { transform: "rotate(-5deg)" },
  },
});

const Description = styled("p")({
  marginTop: "1rem",
  color: "#616161",
  lineHeight: 1.6,
  flex: "1 1 auto",
  position: "relative",
  textAlign: "justify",
  fontWeight: "700",
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

const ImageContainer = styled("div")({
  width: "100%",
  height: "200px",
  borderRadius: "12px",
  marginBottom: "1rem",
  overflow: "hidden",
  position: "relative",
});

/**
 * PrivateEventCardPreview component that shows a real-time preview of how the private event card will appear.
 *
 * Mirrors the styling and layout from the PrivateEvents.tsx component to provide an accurate
 * preview of the final result for administrators creating private events.
 */
const PrivateEventCardPreview = ({
  formData,
  imagePreviewUrl,
  uploadedImageUrl,
}: PrivateEventCardPreviewProps): ReactElement => {
  const [hoveredCard, setHoveredCard] = useState<boolean>(false);

  // Helper functions
  const getRandomIcon = () => {
    const icons = [
      FaBirthdayCake,
      GiCupcake,
      FaGift,
      GiBalloons,
      GiPartyPopper,
    ];
    return icons[0]; // Always use first icon for consistency in preview
  };

  const IconComponent = getRandomIcon();

  // Determine which image to display (prioritize local preview, then uploaded image)
  const displayImageUrl = imagePreviewUrl || uploadedImageUrl;

  return (
    <PreviewContainer>
      <PreviewTitle>Private Event Card Preview</PreviewTitle>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ maxWidth: "500px", margin: "0 auto" }}
      >
        <PartyCard
          elevation={3}
          isHovered={hoveredCard}
          onMouseEnter={() => setHoveredCard(true)}
          onMouseLeave={() => setHoveredCard(false)}
        >
          <FloatingIcon delay={0} style={{ top: "20px", right: "20px" }}>
            <FaStar />
          </FloatingIcon>
          <FloatingIcon delay={1} style={{ top: "60px", right: "60px" }}>
            <FaHeart />
          </FloatingIcon>
          <FloatingIcon delay={2} style={{ bottom: "20px", left: "20px" }}>
            <GiPartyHat />
          </FloatingIcon>

          <PriceTag>
            <FaGift />${formData.price || 0} / Per Person
          </PriceTag>

          <CardContent>
            {/* Image display */}
            {displayImageUrl && (
              <ImageContainer>
                <Image
                  src={displayImageUrl}
                  alt={formData.title || "Private event preview"}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </ImageContainer>
            )}

            <PartyTitle>
              <TitleIconSmall>
                <IconComponent />
              </TitleIconSmall>
              {formData.title || "Event Title"}
            </PartyTitle>

            <Description>
              {formData.description || "Event description will appear here..."}
            </Description>

            {/* Options Display */}
            {formData.hasOptions && formData.optionCategories.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-md font-semibold text-gray-800">
                  Available Options:
                </h4>
                {formData.optionCategories.map((category, categoryIndex) => (
                  <div
                    key={categoryIndex}
                    className="bg-gray-50 rounded-lg p-3"
                  >
                    <h5 className="font-medium text-gray-900 mb-2">
                      {category.categoryName || "Category Name"}
                    </h5>
                    {category.categoryDescription && (
                      <p className="text-sm text-gray-600 mb-2">
                        {category.categoryDescription}
                      </p>
                    )}
                    <div className="space-y-1">
                      {category.choices.map((choice, choiceIndex) => (
                        <div
                          key={choiceIndex}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-700">
                            {choice.name || "Option"}
                          </span>
                          {choice.price && choice.price > 0 && (
                            <span className="font-medium text-gray-900">
                              +${choice.price}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Deposit Display */}
            {formData.isDepositRequired && formData.depositAmount && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0"></div>
                  <div className="ml-2">
                    <p className="text-sm font-medium text-blue-800">
                      <strong>Deposit Required: </strong>$
                      {formData.depositAmount}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </PartyCard>
      </motion.div>
    </PreviewContainer>
  );
};

export default PrivateEventCardPreview;

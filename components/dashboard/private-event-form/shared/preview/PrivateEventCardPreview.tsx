"use client";

import { ReactElement } from "react";
import styled from "@emotion/styled";
import Image from "next/image";
import { FaBirthdayCake } from "react-icons/fa";
import { GiPartyPopper } from "react-icons/gi";
import { Button } from "@/components/ui";
import { PrivateEventFormState } from "../types/privateEventForm.types";

interface PrivateEventCardPreviewProps {
  formData: PrivateEventFormState;
  imagePreviewUrl?: string;
  uploadedImageUrl?: string;
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
  backgroundColor: "white",
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
  border: "1px solid #e5e7eb",
  maxWidth: "500px",
  margin: "0 auto",
});

const ImageContainer = styled("div")({
  width: "100%",
  height: "280px",
  overflow: "hidden",
  position: "relative",
  backgroundColor: "#f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "@media (max-width: 480px)": {
    height: "200px",
  },
});

const PlaceholderIcon = styled("div")({
  fontSize: "3rem",
  color: "rgba(50, 108, 133, 0.2)",
});

const CardContent = styled("div")({
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
});

const TitleRow = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

const PartyTitle = styled("h2")({
  fontSize: "1.35rem",
  fontWeight: "700",
  marginBottom: "0.25rem",
  color: "#1e293b",
  marginTop: "0.75rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

const TitleIcon = styled("span")({
  fontSize: "1.15rem",
  color: "#326C85",
});

const PriceText = styled("span")({
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#326C85",
});

const Description = styled("p")({
  marginTop: "0.75rem",
  color: "#4b5563",
  lineHeight: 1.65,
  textAlign: "left",
  fontWeight: "400",
  fontSize: "0.9rem",
  whiteSpace: "pre-line",
});

/**
 * PrivateEventCardPreview - mirrors PrivateEventCard layout for admin form preview.
 */
const PrivateEventCardPreview = ({
  formData,
  imagePreviewUrl,
  uploadedImageUrl,
}: PrivateEventCardPreviewProps): ReactElement => {
  const displayImageUrl = imagePreviewUrl || uploadedImageUrl;

  return (
    <PreviewContainer>
      <PreviewTitle>Private Event Card Preview</PreviewTitle>

      <CardWrapper>
        <ImageContainer>
          {displayImageUrl ? (
            <Image
              src={displayImageUrl}
              alt={formData.title || "Private event preview"}
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            <PlaceholderIcon>
              <GiPartyPopper />
            </PlaceholderIcon>
          )}
        </ImageContainer>

        <CardContent>
          <TitleRow>
            <PartyTitle>
              <TitleIcon>
                <FaBirthdayCake />
              </TitleIcon>
              {formData.title || "Event Title"}
            </PartyTitle>
            <PriceText>${formData.price || 0}/person</PriceText>
          </TitleRow>

          <Description>
            {formData.description || "Event description will appear here..."}
          </Description>

          {formData.hasOptions && formData.optionCategories.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-md font-semibold text-gray-800">
                Available Options:
              </h4>
              {formData.optionCategories.map((category, categoryIndex) => (
                <div
                  key={categoryIndex}
                  className="rounded-lg bg-gray-50 p-3"
                >
                  <h5 className="mb-2 font-medium text-gray-900">
                    {category.categoryName || "Category Name"}
                  </h5>
                  {category.categoryDescription && (
                    <p className="mb-2 text-sm text-gray-600">
                      {category.categoryDescription}
                    </p>
                  )}
                  <div className="space-y-1">
                    {category.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        className="flex items-center justify-between text-sm"
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

          {formData.isDepositRequired && formData.depositAmount && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-800">
                  <strong>Deposit Required:</strong> ${formData.depositAmount}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  style={{ pointerEvents: "none" }}
                >
                  Pay Deposit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </CardWrapper>
    </PreviewContainer>
  );
};

export default PrivateEventCardPreview;

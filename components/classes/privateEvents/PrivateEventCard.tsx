"use client";

import type { ReactElement } from "react";
import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { PrivateEvent } from "@/types/interfaces";
import Image from "next/image";
import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { FaBirthdayCake, FaInstagram } from "react-icons/fa";
import { GiBalloons, GiCupcake, GiPartyPopper } from "react-icons/gi";
import { Button } from "@/components/ui";

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const TITLE_ICONS = [FaBirthdayCake, GiCupcake, GiBalloons, GiPartyPopper];

// --- Styled Components ---

const CardWrapper = styled("div")({
  borderRadius: "16px",
  overflow: "hidden",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  backgroundColor: "white",
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
  border: "1px solid #e5e7eb",
  transition: "box-shadow 0.2s ease",
  "&:hover": {
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
  },
});

const Price = styled("span")({
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#326C85",
});

const CardContent = styled(Box)({
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
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

// Cap long descriptions and let the overflow scroll inside the card (same
// pattern as the Shop grid card) so card heights stay aligned across the row.
const Description = styled("p")({
  marginTop: "0.75rem",
  color: "#4b5563",
  lineHeight: 1.65,
  maxHeight: "9rem",
  overflowY: "auto",
  overscrollBehavior: "contain",
  paddingRight: "0.25rem",
  scrollbarWidth: "thin",
  textAlign: "left",
  fontWeight: "400",
  fontSize: "0.9rem",
  whiteSpace: "pre-line",
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

// --- Component ---

interface PrivateEventCardProps {
  privateEvent: PrivateEvent;
  index: number;
}

const PrivateEventCard = ({
  privateEvent,
  index,
}: PrivateEventCardProps): ReactElement => {
  const IconComponent = TITLE_ICONS[index % TITLE_ICONS.length];
  const descriptionText = (privateEvent.description || "").trim();

  return (
    <div className="animate-fade-in-up" style={{ height: "100%", animationDelay: `${index * 60}ms` }}>
      <CardWrapper>
        <ImageContainer>
          <Image
            src={
              privateEvent.image
                ? urlFor(privateEvent.image)?.width(600).height(280).url() || "/assets/logos/coastalLogoFull.png"
                : "/assets/logos/coastalLogoFull.png"
            }
            alt={privateEvent.title || "Private event image"}
            fill
            style={{
              objectFit: privateEvent.image ? "cover" : "contain",
              backgroundColor: privateEvent.image ? undefined : "white",
              padding: privateEvent.image ? undefined : "1.5rem",
            }}
          />
        </ImageContainer>

        <CardContent>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <PartyTitle>
              <TitleIcon>
                <IconComponent />
              </TitleIcon>
              {privateEvent.title}
            </PartyTitle>
            <Price>${privateEvent.price}/person</Price>
          </div>

          <Description>{descriptionText}</Description>

          {privateEvent.options && privateEvent.options.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="text-md font-semibold text-gray-800">
                Available Options:
              </h4>
              {privateEvent.options.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-2">
                    {category.categoryName}
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
                        <span className="text-gray-700">{choice.name}</span>
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

          {privateEvent.isDepositRequired && privateEvent.depositAmount && (
            // mt-auto pins the deposit row to the card bottom so the Pay
            // Deposit buttons align across the row regardless of card content.
            <div className="mt-auto pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      <strong>Deposit Required:</strong> $
                      {privateEvent.depositAmount}
                    </p>
                  </div>
                  <Link
                    href={`/payments?eventId=${privateEvent._id}&eventTitle=${encodeURIComponent(privateEvent.title)}&price=${privateEvent.depositAmount}&isPrivateEvent=true`}
                    style={{ textDecoration: "none" }}
                  >
                    <Button variant="primary" size="sm">
                      Pay Deposit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {privateEvent.instagramEmbedCode &&
          privateEvent.instagramEmbedCode.trim() && (
            <InstagramLink
              href={privateEvent.instagramEmbedCode}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </InstagramLink>
          )}
      </CardWrapper>
    </div>
  );
};

export default PrivateEventCard;

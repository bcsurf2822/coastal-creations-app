"use client";

import React, { useState, type ReactElement } from "react";
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
import { motion } from "motion/react";

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const TITLE_ICONS = [FaBirthdayCake, GiCupcake, GiBalloons, GiPartyPopper];

const TRUNCATE_LENGTH = 180;

// --- Styled Components ---

const CardWrapper = styled("div")({
  borderRadius: "16px",
  overflow: "hidden",
  height: "100%",
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

const PlaceholderIcon = styled("div")({
  fontSize: "3rem",
  color: "rgba(50, 108, 133, 0.2)",
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

const Description = styled("p")({
  marginTop: "0.75rem",
  color: "#4b5563",
  lineHeight: 1.65,
  flex: "1 1 auto",
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
  const [isExpanded, setIsExpanded] = useState(false);

  const IconComponent = TITLE_ICONS[index % TITLE_ICONS.length];
  const descriptionText = (privateEvent.description || "").trim();

  const needsTruncation = descriptionText.length > TRUNCATE_LENGTH;
  const displayText =
    !isExpanded && needsTruncation
      ? descriptionText.slice(
          0,
          descriptionText.lastIndexOf(" ", TRUNCATE_LENGTH),
        ) + "..."
      : descriptionText;

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div variants={itemVariants} style={{ height: "100%" }}>
      <CardWrapper>
        <ImageContainer>
          {privateEvent.image ? (
            <Image
              src={
                urlFor(privateEvent.image)?.width(600).height(280).url() || ""
              }
              alt={privateEvent.title || "Private event image"}
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

          <Description>
            {displayText}
            {needsTruncation && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#326C85",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  padding: "0 0.25rem",
                }}
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
            )}
          </Description>

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
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
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
    </motion.div>
  );
};

export default PrivateEventCard;

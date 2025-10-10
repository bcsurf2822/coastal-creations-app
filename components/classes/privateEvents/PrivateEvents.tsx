"use client";

import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Box, Container, Paper, CircularProgress, Alert } from "@mui/material";
import { PrivateEvent } from "@/types/interfaces";
import Image from "next/image";
import Link from "next/link";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import {
  FaBirthdayCake,
  FaGift,
  FaStar,
  FaHeart,
  FaEnvelope,
} from "react-icons/fa";
import {
  GiBalloons,
  GiPartyPopper,
  GiCupcake,
  GiPartyHat,
} from "react-icons/gi";

// Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

// Create styled components
const StyledContainer = styled(Container)({
  padding: "4rem 2rem",
  maxWidth: "1200px",
  fontFamily: "var(--font-montserrat)",
});

const Title = styled("h1")({
  fontSize: "2.75rem",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: "3rem",
  color: "#326C85", // Updated title color
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

const PartyCard = styled(Paper)<PartyCardProps>(({ isHovered }) => ({
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

const GridContainer = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(1, 1fr)",
  gap: "2rem",
  "@media (min-width: 768px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
});

const GridItem = styled("div")({
  width: "100%",
  position: "relative",
});

const ContactMessage = styled("div")({
  textAlign: "center",
  marginTop: "3rem",
  padding: "2.5rem",
  background:
    "linear-gradient(135deg, rgba(25,118,210,0.1), rgba(66,165,245,0.1))",
  borderRadius: "25px",
  border: "3px solid rgba(25,118,210,0.2)",
  fontSize: "1.2rem",
  color: "#424242",
  position: "relative",
  overflow: "hidden",
  fontWeight: "700",
  "&:before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      "radial-gradient(circle, rgba(25,118,210,0.1) 0%, transparent 70%)",
    animation: "pulse 4s ease-in-out infinite",
  },
  "@keyframes pulse": {
    "0%, 100%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
  },
  "& a": {
    color: "#1976D2",
    textDecoration: "none",
    fontWeight: "700",
    transition: "all 0.3s ease",
    position: "relative",
    "&:hover": {
      color: "#42A5F5",
      transform: "scale(1.05)",
    },
  },
});

const ContactIcon = styled("div")({
  display: "inline-block",
  fontSize: "2rem",
  color: "#42A5F5",
  marginBottom: "1rem",
  animation: "heartbeat 2s ease-in-out infinite",
  "@keyframes heartbeat": {
    "0%, 100%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.1)" },
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
  color: "#1976D2",
  fontSize: "1.25rem",
  fontWeight: "700",
  animation: "colorChange 2s ease-in-out infinite",
  "@keyframes colorChange": {
    "0%, 100%": { color: "#1976D2" },
    "50%": { color: "#42A5F5" },
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

const ImageContainer = styled("div")({
  width: "100%",
  height: "200px",
  borderRadius: "12px",
  marginBottom: "1rem",
  overflow: "hidden",
  position: "relative",
});

const BookNowButton = styled("button")({
  marginTop: "1.5rem",
  width: "100%",
  padding: "1rem 2rem",
  background: "linear-gradient(135deg, #1976D2, #42A5F5)",
  color: "white",
  fontSize: "1.125rem",
  fontWeight: "700",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(25, 118, 210, 0.3)",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)",
    background: "linear-gradient(135deg, #1565C0, #1976D2)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
});

const PrivateEvents = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [privateEvents, setPrivateEvents] = useState<PrivateEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrivateEvents = async () => {
      try {
        const response = await fetch("/api/private-events");
        const data = await response.json();

        if (data.success) {
          setPrivateEvents(data.privateEvents);
        } else {
          setError(data.error || "Failed to fetch private events");
        }
      } catch (err) {
        setError("Failed to fetch private events");
        console.error("Error fetching private events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivateEvents();
  }, []);

  const getRandomIcon = (index: number) => {
    const icons = [
      FaBirthdayCake,
      GiCupcake,
      FaGift,
      GiBalloons,
      GiPartyPopper,
    ];
    return icons[index % icons.length];
  };

  if (loading) {
    return (
      <StyledContainer>
        <LoadingContainer>
          <CircularProgress
            size={60}
            sx={{
              color: "#1976D2",
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />
          <LoadingText>Loading...</LoadingText>
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
          <FaBirthdayCake />
        </TitleIcon>
        Private Events
        <TitleIcon>
          <GiBalloons />
        </TitleIcon>
      </Title>

      <GridContainer>
        {privateEvents.map((privateEvent, index) => {
          const IconComponent = getRandomIcon(index);
          return (
            <GridItem key={privateEvent._id}>
              <PartyCard
                elevation={3}
                isHovered={hoveredCard === index}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <FloatingIcon
                  delay={index * 0.5}
                  style={{ top: "20px", right: "20px" }}
                >
                  <FaStar />
                </FloatingIcon>
                <FloatingIcon
                  delay={index * 0.5 + 1}
                  style={{ top: "60px", right: "60px" }}
                >
                  <FaHeart />
                </FloatingIcon>
                <FloatingIcon
                  delay={index * 0.5 + 2}
                  style={{ bottom: "20px", left: "20px" }}
                >
                  <GiPartyHat />
                </FloatingIcon>

                <PriceTag>
                  <FaGift />${privateEvent.price}
                </PriceTag>

                <CardContent>
                  {/* Image display */}
                  {privateEvent.image && (
                    <ImageContainer>
                      <Image
                        src={
                          urlFor(privateEvent.image)
                            ?.width(400)
                            .height(200)
                            .url() || ""
                        }
                        alt={privateEvent.title || "Private event image"}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </ImageContainer>
                  )}

                  <PartyTitle>
                    <TitleIconSmall>
                      <IconComponent />
                    </TitleIconSmall>
                    {privateEvent.title}
                  </PartyTitle>

                  <Description className="text-lg">
                    {privateEvent.description}
                  </Description>

                  {/* Options Display */}
                  {privateEvent.options && privateEvent.options.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-md font-semibold text-gray-800">
                        Available Options:
                      </h4>
                      {privateEvent.options.map((category, categoryIndex) => (
                        <div
                          key={categoryIndex}
                          className="bg-gray-50 rounded-lg p-3"
                        >
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
                                <span className="text-gray-700">
                                  {choice.name}
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
                  {privateEvent.isDepositRequired &&
                    privateEvent.depositAmount && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0"></div>
                          <div className="ml-2">
                            <p className="text-sm font-medium text-blue-800">
                              <strong> Deposit Required: </strong>$
                              {privateEvent.depositAmount}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Book Now Button */}
                  {privateEvent.isDepositRequired &&
                    privateEvent.depositAmount && (
                      <Link
                        href={`/payments?eventId=${privateEvent._id}&eventTitle=${encodeURIComponent(privateEvent.title)}&price=${privateEvent.depositAmount}&isPrivateEvent=true`}
                        style={{ textDecoration: "none" }}
                      >
                        <BookNowButton>
                          Pay Deposit - ${privateEvent.depositAmount}
                        </BookNowButton>
                      </Link>
                    )}
                </CardContent>
              </PartyCard>
            </GridItem>
          );
        })}
      </GridContainer>

      <ContactMessage>
        <ContactIcon>
          <FaEnvelope />
        </ContactIcon>
        <div>
          <div className="text-2xl font-bold text-black mb-4">
            Please contact the studio to arrange a private event at{" "}
            <a href="mailto:info@coastalcreationsstudio.com">
              info@coastalcreationsstudio.com
            </a>
          </div>
          {privateEvents.some((event) => event.isDepositRequired) ? (
            <div
              className="mb-4"
              style={{
                fontSize: "1.3rem",
                fontWeight: "800",
                color: "#1976D2",
              }}
            ></div>
          ) : (
            <div
              className="mb-4"
              style={{
                fontSize: "1.3rem",
                fontWeight: "800",
                color: "#1976D2",
              }}
            >
              Contact us for custom pricing and availability
            </div>
          )}
          {/* <div className="mb-4 text-md text-green-800">
            Payment portal for private events available soon!
          </div> */}
        </div>
      </ContactMessage>
    </StyledContainer>
  );
};

export default PrivateEvents;

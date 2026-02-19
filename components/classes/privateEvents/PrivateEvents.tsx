"use client";

import React from "react";
import styled from "@emotion/styled";
import { Box, Container, CircularProgress, Alert } from "@mui/material";
import { PrivateEvent } from "@/types/interfaces";
import { FaEnvelope } from "react-icons/fa";
import { usePrivateEvents } from "@/hooks/queries";
import PrivateEventCard from "./PrivateEventCard";

const StyledContainer = styled(Container)({
  padding: "4rem 2rem",
  maxWidth: "1200px",
  fontFamily: "var(--font-montserrat)",
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

const PrivateEvents = () => {
  const {
    data: privateEventsData = [],
    isLoading: loading,
    error,
  } = usePrivateEvents();
  const privateEvents: PrivateEvent[] = privateEventsData as PrivateEvent[];

  if (loading) {
    return (
      <StyledContainer>
        <LoadingContainer>
          <CircularProgress
            size={60}
            sx={{
              color: "#1976D2",
              "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
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
            "& .MuiAlert-icon": { fontSize: "1.5rem" },
          }}
        >
          {error.message}
        </Alert>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <GridContainer>
        {privateEvents.map((privateEvent, index) => (
          <GridItem key={privateEvent._id}>
            <PrivateEventCard privateEvent={privateEvent} index={index} />
          </GridItem>
        ))}
      </GridContainer>

      <ContactMessage>
        <ContactIcon>
          <FaEnvelope />
        </ContactIcon>
        <div>
          <div className="text-2xl font-bold text-black mb-4">
            Please contact the studio to arrange a private event at:{" "}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_STUDIO_EMAIL || "info@coastalcreationsstudio.com"}`}
            >
              {process.env.NEXT_PUBLIC_STUDIO_EMAIL ||
                "info@coastalcreationsstudio.com"}
            </a>
          </div>
        </div>
      </ContactMessage>
    </StyledContainer>
  );
};

export default PrivateEvents;

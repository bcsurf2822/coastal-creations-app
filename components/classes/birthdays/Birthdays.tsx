"use client";

import React, { useState } from "react";
import styled from "@emotion/styled";
import { Box, Container, Paper } from "@mui/material";

// Create styled components
const StyledContainer = styled(Container)({
  padding: "4rem 2rem",
  maxWidth: "1200px",
});

const Title = styled("h1")({
  fontSize: "2.75rem",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: "3rem",
  color: "#1976d2", // MUI primary color
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80px",
    height: "4px",
    background: "linear-gradient(90deg, #1976d2, #42a5f5)",
    borderRadius: "2px",
  },
  "@media (max-width: 600px)": {
    fontSize: "2rem",
  },
});

const PriceTag = styled("div")({
  display: "inline-block",
  fontSize: "1.25rem",
  fontWeight: "bold",
  color: "white",
  background: "linear-gradient(90deg, #1976d2, #42a5f5)",
  padding: "0.5rem 1rem",
  borderRadius: "0 0 8px 0",
  position: "absolute",
  top: 0,
  left: 0,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  zIndex: 1,
});

interface PartyCardProps {
  isHovered: boolean;
}

const PartyCard = styled(Paper)<PartyCardProps>(({ isHovered }) => ({
  borderRadius: "12px",
  overflow: "hidden",
  height: "100%",
  position: "relative",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  boxShadow: isHovered
    ? "0 20px 40px rgba(0, 0, 0, 0.2)"
    : "0 8px 24px rgba(0, 0, 0, 0.12)",
  transform: isHovered
    ? "translateY(-15px) scale(1.02)"
    : "translateY(0) scale(1)",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(to bottom, rgba(255,255,255,0) 70%, rgba(25,118,210,0.05) 100%)",
    opacity: isHovered ? 1 : 0,
    transition: "opacity 0.4s ease",
    zIndex: 0,
  },
}));

const CardContent = styled(Box)({
  padding: "2rem",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  zIndex: 2,
  position: "relative",
});

const PartyTitle = styled("h2")({
  fontSize: "1.75rem",
  fontWeight: "bold",
  marginBottom: "0.5rem",
  color: "#1976d2", // MUI primary color
  marginTop: "1.5rem",
  position: "relative",
  display: "inline-block",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-4px",
    left: "0",
    width: "0",
    height: "2px",
    background: "linear-gradient(90deg, #1976d2, #42a5f5)",
    transition: "width 0.3s ease",
  },
  "&:hover:after": {
    width: "100%",
  },
});

const SectionTitle = styled("h3")({
  fontSize: "1.25rem",
  fontWeight: "bold",
  margin: "1.5rem 0 0.75rem",
  color: "#424242",
  borderBottom: "2px solid #e0e0e0",
  paddingBottom: "0.5rem",
});

const List = styled("ul")({
  paddingLeft: "1.5rem",
  marginBottom: "1rem",
  "& li": {
    marginBottom: "0.75rem",
    position: "relative",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateX(5px)",
    },
    "&::marker": {
      color: "#1976d2",
    },
  },
});

const Description = styled("p")({
  marginTop: "1rem",
  color: "#616161",
  lineHeight: 1.6,
  flex: "1 1 auto",
});

const MinimumNote = styled("div")({
  position: "relative",
  display: "inline-block",
  color: "#757575",
  marginBottom: "1rem",
  padding: "0.25rem 0.5rem",
  fontSize: "0.875rem",
  borderLeft: "2px solid #1976d2",
  background: "rgba(25, 118, 210, 0.05)",
  borderRadius: "0 4px 4px 0",
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
});

const Birthdays = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <StyledContainer>
      <Title>Birthday Party Packages</Title>

      <GridContainer>
        {/* Canvas Easel Party */}
        <GridItem>
          <PartyCard
            elevation={3}
            isHovered={hoveredCard === 0}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <PriceTag>$30 per child</PriceTag>
            <CardContent>
              <PartyTitle>Canvas Easel Party</PartyTitle>

              <MinimumNote>10 child minimum</MinimumNote>

              <SectionTitle>What&apos;s Included:</SectionTitle>

              <List>
                <li>1.5 Hours Studio Rental</li>
                <li>Guided Instruction</li>
                <li>Pre-Designed Canvas</li>
                <li>
                  Easel, Canvas Pad, Paint, and a Travel Friendly Carrying Case
                  for each guest
                </li>
              </List>

              <Description>
                Choose up to 6 unique pre-designed canvas options! Our
                instructor will guide your group through the painting process.
                Each child will take home their very own masterpiece and a
                travel tote with a canvas pad and paint for future creative
                adventures.
              </Description>
            </CardContent>
          </PartyCard>
        </GridItem>

        {/* Expressive Paint Party */}
        <GridItem>
          <PartyCard
            elevation={3}
            isHovered={hoveredCard === 1}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <PriceTag>$25 per child</PriceTag>
            <CardContent>
              <PartyTitle>Expressive Paint Party</PartyTitle>

              <MinimumNote>10 child minimum</MinimumNote>

              <SectionTitle>What&apos;s Included:</SectionTitle>

              <List>
                <li>1.5 Hours Studio Rental</li>
                <li>Facilitator for Assistance</li>
                <li>8x10 Canvas and Paint</li>
                <li>Specialty tool, brushes, and textures</li>
              </List>

              <Description>
                Children receive an 8x10 canvas with all paints, brushes,
                specialty tools, and textures to create an abstract masterpiece.
                This party does not have guidelines to paint. Grab a tool &
                paint your heart out!
              </Description>
            </CardContent>
          </PartyCard>
        </GridItem>
      </GridContainer>
    </StyledContainer>
  );
};

export default Birthdays;

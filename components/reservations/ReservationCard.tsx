"use client";

import { ReactElement, useState } from "react";
import styled from "@emotion/styled";
import { Paper } from "@mui/material";
import Link from "next/link";
import { motion } from "motion/react";
import Image from "next/image";
import { FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import { IReservation } from "@/lib/models/Reservations";

interface ReservationCardProps {
  reservation: IReservation;
  baseUrl: string;
  index?: number;
}

interface CardStyledProps {
  isHovered: boolean;
}

const Card = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isHovered",
})<CardStyledProps>(({ isHovered }) => ({
  borderRadius: "20px",
  overflow: "hidden",
  height: "100%",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  boxShadow: isHovered
    ? "0 20px 40px rgba(50, 108, 133, 0.25)"
    : "0 8px 24px rgba(66, 165, 245, 0.15)",
  transform: isHovered
    ? "translateY(-12px) scale(1.03) rotate(1deg)"
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

const ImageContainer = styled("div")({
  position: "relative",
  height: "200px",
  width: "100%",
  overflow: "hidden",
  flex: "0 0 auto",
});

const StyledImage = styled(Image, {
  shouldForwardProp: (prop) => prop !== "isPlaceholder",
})<{ isPlaceholder?: boolean }>(({ isPlaceholder }) => ({
  objectFit: isPlaceholder ? "contain" : "cover",
  transition: "all 0.3s ease",
  padding: isPlaceholder ? "1rem" : "0",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const CardContent = styled("div")({
  padding: "2rem",
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
  position: "relative",
  zIndex: 2,
  justifyContent: "space-between",
});

const ReservationTitle = styled("h3")({
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginBottom: "0.75rem",
  color: "#326C85",
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
    background: "linear-gradient(90deg, #326C85, #42A5F5)",
    transition: "width 0.3s ease",
    borderRadius: "2px",
  },
  "&:hover:after": {
    width: "100%",
  },
});

const Description = styled("p")({
  marginTop: "0.5rem",
  marginBottom: "1rem",
  color: "#616161",
  lineHeight: 1.6,
  flex: "1",
  textAlign: "justify",
  fontWeight: "400",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
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

const PLACEHOLDER_IMAGE = "/assets/logos/coastalLogoFull.png";

export default function ReservationCard({
  reservation,
  baseUrl,
  index = 0,
}: ReservationCardProps): ReactElement {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDateRange = (): string => {
    const startDate = formatDate(reservation.dates.startDate);
    const endDate = reservation.dates.endDate
      ? formatDate(reservation.dates.endDate)
      : null;

    return endDate ? `${startDate} - ${endDate}` : startDate;
  };

  return (
    <motion.div
      key={reservation._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        elevation={3}
        isHovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <ImageContainer>
          <StyledImage
            src={reservation.image || PLACEHOLDER_IMAGE}
            alt={reservation.eventName}
            fill
            isPlaceholder={!reservation.image}
          />
        </ImageContainer>

        <CardContent>
          <div>
            <ReservationTitle>{reservation.eventName}</ReservationTitle>

            <Description>{reservation.description}</Description>

            <InfoGrid>
              <InfoItem>
                <InfoIcon>
                  <FaCalendarAlt />
                </InfoIcon>
                {getDateRange()}
              </InfoItem>
              <InfoItem>
                <InfoIcon>
                  <FaDollarSign />
                </InfoIcon>
                ${reservation.pricePerDayPerParticipant} per day per
                participant
              </InfoItem>
            </InfoGrid>
          </div>

          {/* Action Button */}
          <Link
            href={`${baseUrl}/${reservation._id}`}
            style={{ textDecoration: "none", alignSelf: "flex-start" }}
          >
            <ActionButton>View Availability</ActionButton>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import React, { useState, useMemo, ReactElement } from "react";
import styled from "@emotion/styled";
import { Box, Container, CircularProgress, Alert } from "@mui/material";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import UniversalEventCard, { UniversalEventData, CardConfig } from "./EventCard";
import { getRandomIcon } from "./eventUtils";
import { useEvents, useCustomers, useEventPictures } from "@/hooks/queries";

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

interface PageConfig {
  title: string;
  titleIcons?: {
    left?: ReactElement;
    right?: ReactElement;
  };
  subtitle?: string;
  sectionTitle?: string;
  eventTypeFilter: (eventType: string) => boolean;
  eventSort?: (a: UniversalEventData, b: UniversalEventData) => number;
  layout?: "grid" | "list";
  gridColumns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  cardConfig: CardConfig;
  emptyStateMessage?: string;
  emptyStateSubmessage?: string;
  emptyStateIcon?: ReactElement;
  loadingMessage?: string;
  fetchParticipantCounts?: boolean;
  useEventPictures?: boolean;
  baseUrl?: string;
}

export interface EventsContainerProps {
  config: PageConfig;
}

const StyledContainer = styled(Container)({
  padding: "4rem 2rem",
  maxWidth: "1200px",
  fontFamily: "var(--font-montserrat)",
});

const Title = styled("h1")({
  fontSize: "2.75rem",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: "1.5rem",
  color: "#326C85",
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

const Subtitle = styled("p")({
  textAlign: "center",
  maxWidth: "600px",
  margin: "0 auto 3rem",
  fontSize: "1.125rem",
  color: "black",
  lineHeight: 1.6,
  fontWeight: "700",
});

const SectionTitle = styled("h2")({
  fontSize: "2rem",
  fontWeight: "700",
  marginBottom: "2rem",
  color: "#326C85",
  position: "relative",
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
  color: "#326C85",
  fontSize: "1.25rem",
  fontWeight: "bold",
  animation: "colorChange 2s ease-in-out infinite",
  "@keyframes colorChange": {
    "0%, 100%": { color: "#326C85" },
    "50%": { color: "#42A5F5" },
  },
});

const EmptyState = styled("div")({
  textAlign: "center",
  padding: "3rem 2rem",
  background:
    "linear-gradient(135deg, rgba(50,108,133,0.05), rgba(66,165,245,0.05))",
  borderRadius: "20px",
  border: "2px solid rgba(50,108,133,0.1)",
  color: "#616161",
  fontSize: "1.125rem",
  fontWeight: "700",
});

const GridContainer = styled("div")<{ columns?: { mobile?: number; tablet?: number; desktop?: number } }>(
  ({ columns = { mobile: 1, tablet: 2, desktop: 3 } }) => ({
    display: "grid",
    gridTemplateColumns: `repeat(${columns.mobile || 1}, 1fr)`,
    gap: "2rem",
    "@media (min-width: 768px)": {
      gridTemplateColumns: `repeat(${columns.tablet || 2}, 1fr)`,
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: `repeat(${columns.desktop || 3}, 1fr)`,
    },
  })
);

const ListContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
});

const EventsContainer: React.FC<EventsContainerProps> = ({ config }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // React Query hooks
  const {
    data: eventsData,
    isLoading,
    error,
  } = useEvents();

  const { data: customersData = [] } = useCustomers({
    enabled: !!config.fetchParticipantCounts,
  });

  const { data: eventPicturesData = [] } = useEventPictures(
    !!config.useEventPictures
  );

  // Transform events data - useEvents returns ApiEvent[] directly
  const events: UniversalEventData[] = (eventsData || []) as UniversalEventData[];
  const eventPictures: SanityDocument[] = eventPicturesData;

  // Calculate participant counts from customers data
  const eventParticipantCounts = useMemo(() => {
    if (!config.fetchParticipantCounts || !customersData.length) return {};

    const counts: Record<string, number> = {};
    customersData.forEach((customer) => {
      const eventId = customer.event?._id;
      if (eventId) counts[eventId] = (counts[eventId] || 0) + customer.quantity;
    });
    return counts;
  }, [customersData, config.fetchParticipantCounts]);

  const findMatchingEventPicture = (eventName: string): SanityDocument | undefined => {
    if (!eventPictures?.length) return undefined;
    return eventPictures.find((picture) =>
      picture.title?.toLowerCase() === eventName.toLowerCase()
    );
  };

  const defaultSort = (a: UniversalEventData, b: UniversalEventData): number => {
    return new Date(a.dates.startDate).getTime() - new Date(b.dates.startDate).getTime();
  };

  const filteredEvents = events
    .filter((event) => config.eventTypeFilter(event.eventType))
    .sort(config.eventSort || defaultSort);

  if (isLoading) {
    return (
      <StyledContainer>
        <LoadingContainer>
          <CircularProgress size={60} sx={{ color: "#326C85" }} />
          <LoadingText>{config.loadingMessage || "Loading events..."}</LoadingText>
        </LoadingContainer>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Alert severity="error" sx={{ mb: 4, borderRadius: "15px" }}>
          Error loading events: {error.message}
        </Alert>
      </StyledContainer>
    );
  }

  const renderCards = (): ReactElement => {
    const cards = filteredEvents.map((event, index) => {
      const matchingPicture = findMatchingEventPicture(event.eventName);
      const imageUrl = matchingPicture?.image
        ? urlFor(matchingPicture.image)?.width(800).height(600).url()
        : event.image || null;

      return (
        <UniversalEventCard
          key={event._id}
          event={event}
          index={index}
          isHovered={hoveredCard === index}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
          icon={getRandomIcon(index, event.eventType)}
          imageUrl={imageUrl}
          currentParticipants={eventParticipantCounts[event._id] || 0}
          config={config.cardConfig}
          baseUrl={config.baseUrl}
        />
      );
    });

    if (config.layout === "grid") {
      return <GridContainer columns={config.gridColumns}>{cards}</GridContainer>;
    } else {
      return <ListContainer>{cards}</ListContainer>;
    }
  };

  return (
    <StyledContainer>
      <Title>
        {config.titleIcons?.left && <TitleIcon>{config.titleIcons.left}</TitleIcon>}
        {config.title}
        {config.titleIcons?.right && <TitleIcon>{config.titleIcons.right}</TitleIcon>}
      </Title>

      {config.subtitle && <Subtitle>{config.subtitle}</Subtitle>}

      {config.sectionTitle && <SectionTitle>{config.sectionTitle}</SectionTitle>}

      {filteredEvents.length === 0 ? (
        <EmptyState>
          {config.emptyStateIcon && (
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              {config.emptyStateIcon}
            </div>
          )}
          <div>{config.emptyStateMessage || "No events currently scheduled."}</div>
          {config.emptyStateSubmessage && (
            <div style={{ marginTop: "0.5rem", fontSize: "1rem" }}>
              {config.emptyStateSubmessage}
            </div>
          )}
        </EmptyState>
      ) : (
        renderCards()
      )}
    </StyledContainer>
  );
};

export default EventsContainer;

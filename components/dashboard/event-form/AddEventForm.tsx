"use client";
import { ReactElement, useState } from "react";
import EventFormBase from "./EventFormBase";

const AddEventForm = (): ReactElement => {
  const [, setSelectedEventType] = useState<
    "class" | "camp" | "workshop" | "artist" | "reservation"
  >("class");

  const handleEventTypeChange = (
    eventType: "class" | "camp" | "workshop" | "artist" | "reservation"
  ) => {
    setSelectedEventType(eventType);
  };

  return (
    <EventFormBase
      mode="add"
      title="Create New Event"
      onEventTypeChange={handleEventTypeChange}
    />
  );
};

export default AddEventForm;

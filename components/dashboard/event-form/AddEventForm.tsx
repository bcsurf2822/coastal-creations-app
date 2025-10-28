"use client";
import { ReactElement, useState } from "react";
import EventFormBase from "./EventFormBase";

const AddEventForm = (): ReactElement => {
  const [, setSelectedEventType] = useState<
    "adult-class" | "kid-class" | "event" | "camp" | "artist"
  >("adult-class");

  const handleEventTypeChange = (
    eventType: "adult-class" | "kid-class" | "event" | "camp" | "artist"
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

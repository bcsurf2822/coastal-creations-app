"use client";
import { JSX } from "react";
import EventContainer from "@/components/dashboard/EventContainer";
import { RiCalendarEventFill, RiMoneyDollarCircleFill } from "react-icons/ri";
import * as React from "react";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";

// Stat card component
function StatCard({
  title,
  value,
  icon,
  change,
  changeType = "positive",
}: {
  title: string;
  value: string | number;
  icon: JSX.Element;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
}) {
  const changeColor = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-gray-500",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </h3>
          {change && (
            <p className={`text-sm mt-2 ${changeColor[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-300">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Define types for SimpleDialog props
interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  eventDetails: {
    title: string;
    description: string;
    date: string;
  };
}

// Update SimpleDialog component with types
function SimpleDialog({ open, onClose, eventDetails }: SimpleDialogProps) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{eventDetails.title}</DialogTitle>
      <div className="p-4">
        <Typography variant="body1">{eventDetails.description}</Typography>
        <Typography variant="body2" color="textSecondary">
          Date: {eventDetails.date}
        </Typography>
      </div>
    </Dialog>
  );
}

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState({
    title: "",
    description: "",
    date: "",
  });

  // Update handleEventClick function with types
  const handleEventClick = (eventDetails: {
    title: string;
    description: string;
    date: string;
  }) => {
    setSelectedEvent(eventDetails);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // These would typically come from API calls in a real implementation
  const stats = {
    totalEvents: "TBD",
    revenue: "TBD",
  };

  // Example event details
  const exampleEvent = {
    title: "Sample Event",
    description: "This is a sample event description.",
    date: "2023-10-15",
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h2>
        <div className="inline-flex">
          <Button variant="contained" color="primary">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          icon={<RiCalendarEventFill className="w-6 h-6" />}
          change="TBD"
          changeType="positive"
        />

        <StatCard
          title="Revenue"
          value={stats.revenue}
          icon={<RiMoneyDollarCircleFill className="w-6 h-6" />}
          change="TBD"
          changeType="positive"
        />
      </div>

      {/* Events section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Event Management
        </h3>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleEventClick(exampleEvent)}
        >
          View Event
        </Button>
        <EventContainer />
      </div>

      {/* Event Dialog */}
      <SimpleDialog
        open={isDialogOpen}
        onClose={closeDialog}
        eventDetails={selectedEvent}
      />
    </div>
  );
}

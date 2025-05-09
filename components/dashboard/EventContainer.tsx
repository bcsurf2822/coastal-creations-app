// components/EventContainer.tsx
"use client";

import { useState } from "react";

interface Event {
  id: string;
  name: string;
}

interface EventContainerProps {
  initialEvents: Event[];
}

export default function EventContainer({ initialEvents }: EventContainerProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);

  const handleDelete = (id: string) => {
    const updatedEvents = events.filter((event) => event.id !== id);
    setEvents(updatedEvents);
    console.log(`Deleted event with id: ${id}`);
  };

  return (
    // Applying Tailwind classes for styling
    <div className="bg-white p-5 rounded-lg shadow-md">
      <h2 className="text-xl text-gray-800 mb-4">Upcoming Events</h2>
      {events.length === 0 ? (
        <p className="text-gray-600">No upcoming events.</p>
      ) : (
        <ul className="list-none p-0 m-0">
          {events.map((event) => (
            <li
              key={event.id}
              className="bg-gray-200 p-4 mb-3 rounded flex justify-between items-center"
            >
              <span className="flex-grow mr-3 text-gray-800">{event.name}</span>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors duration-300 ease-in-out cursor-pointer flex-shrink-0"
                onClick={() => handleDelete(event.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

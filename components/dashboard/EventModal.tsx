import React from "react";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: {
    title: string;
    description: string;
    date: string;
  };
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  eventDetails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-11/12 max-w-md">
        <h2 className="text-xl font-bold mb-4">{eventDetails.title}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {eventDetails.description}
        </p>
        <p className="text-gray-500 dark:text-gray-400">{eventDetails.date}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EventModal;

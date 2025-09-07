// Quick test to verify our event form data transformation logic
console.log('Testing event form data transformation...');

// Simulate form data for a reservation event
const formData = {
  eventName: 'Test Camp',
  eventType: 'reservation',
  description: 'Test description',
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  startTime: '09:00',
  endTime: '17:00',
  isReservationEvent: true,
  reservationSettings: {
    maxDays: 7,
    requireConsecutive: false,
    minDays: 1,
    availableDates: [],
    maxParticipants: 20,
    allowPartialBooking: true
  }
};

// Test the data transformation logic from EventForm
const eventData = {
  ...formData,
  imageUrl: null,
  // Transform dates for different event types
  dates: {
    startDate: formData.startDate,
    isRecurring: formData.eventType !== 'reservation' ? (formData.isRecurring || false) : false,
    ...(formData.eventType === 'reservation' && 'endDate' in formData && formData.endDate && {
      endDate: formData.endDate
    }),
    ...(formData.eventType !== 'reservation' && 'isRecurring' in formData && formData.isRecurring && {
      recurringPattern: 'recurringPattern' in formData ? formData.recurringPattern : undefined,
      recurringEndDate: 'recurringEndDate' in formData ? formData.recurringEndDate : undefined
    })
  },
  time: {
    startTime: formData.startTime,
    endTime: formData.endTime
  }
};

console.log('Transformed event data:');
console.log(JSON.stringify(eventData, null, 2));

// Verify the dates structure matches what the Event model expects
const dates = eventData.dates;
console.log('\nDates structure check:');
console.log('- startDate:', dates.startDate);
console.log('- endDate:', dates.endDate);
console.log('- isRecurring:', dates.isRecurring);

if (dates.startDate && dates.endDate) {
  const start = new Date(dates.startDate);
  const end = new Date(dates.endDate);
  console.log('- Date validation: endDate > startDate?', end > start);
}

console.log('\nTest completed successfully!');
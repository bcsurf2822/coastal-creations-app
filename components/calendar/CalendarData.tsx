// "use client";

// import { useEffect, useState } from "react";

// // TypeScript definitions for Google API
// declare global {
//   interface Window {
//     gapi: typeof gapi;
//     google: {
//       accounts: {
//         oauth2: {
//           initTokenClient: (config: any) => any;
//           revoke: (token: string, callback?: () => void) => void;
//         };
//       };
//     };
//   }
// }

// // Add gapi type reference
// declare const gapi: {
//   load: (api: string, callback: () => void) => void;
//   client: {
//     init: (config: any) => Promise<void>;
//     getToken: () => { access_token: string } | null;
//     setToken: (token: string) => void;
//     calendar: {
//       events: {
//         list: (params: any) => Promise<any>;
//       };
//     };
//   };
// };

// // Discovery doc URL for APIs used by the quickstart
// const DISCOVERY_DOC =
//   "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

// // Authorization scopes required by the API; multiple scopes can be
// // included, separated by spaces.
// const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// // Define the interface for Google Calendar events
// export interface GoogleCalendarEvent {
//   id: string;
//   summary: string;
//   start: {
//     dateTime: string;
//     date?: string;
//   };
//   end: {
//     dateTime: string;
//     date?: string;
//   };
//   status: string;
//   // Add any other properties you need
// }

// interface CalendarDataProps {
//   onEventsLoaded?: (events: GoogleCalendarEvent[]) => void;
// }

// export default function CalendarData({
//   onEventsLoaded,
// }: CalendarDataProps = {}) {
//   const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
//   const [gapiReady, setGapiReady] = useState(false);
//   const [gisReady, setGisReady] = useState(false);
//   const [authorized, setAuthorized] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [apiKey, setApiKey] = useState(
//     process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""
//   );
//   const [clientId, setClientId] = useState(
//     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
//   );

//   useEffect(() => {
//     const handleClientLoad = () => {
//       gapi.load("client", initializeGapiClient);
//     };

//     const handleGisLoad = () => {
//       window.google.accounts.oauth2.initTokenClient({
//         client_id: clientId,
//         scope: SCOPES,
//         callback: "",
//       });
//       setGisReady(true);
//     };

//     if (!window.gapi) {
//       const script = document.createElement("script");
//       script.src = "https://apis.google.com/js/api.js";
//       script.onload = handleClientLoad;
//       document.body.appendChild(script);
//     } else {
//       handleClientLoad();
//     }

//     if (!window.google) {
//       const script = document.createElement("script");
//       script.src = "https://accounts.google.com/gsi/client";
//       script.onload = handleGisLoad;
//       document.body.appendChild(script);
//     } else {
//       handleGisLoad();
//     }
//   }, [clientId]);

//   const initializeGapiClient = async () => {
//     try {
//       await gapi.client.init({
//         apiKey: apiKey,
//         discoveryDocs: [DISCOVERY_DOC],
//       });
//       setGapiReady(true);

//       // Check if the user is already signed in
//       const token = gapi.client.getToken();
//       setAuthorized(token !== null);
//     } catch (error) {
//       console.error("Error initializing Google API client:", error);
//     }
//   };

//   const handleAuthClick = async () => {
//     // @ts-expect-error - Google API types are not fully available
//     const tokenClient = window.google.accounts.oauth2.initTokenClient({
//       client_id: clientId,
//       scope: SCOPES,
//       callback: async (resp: { error?: string }) => {
//         if (resp.error !== undefined) {
//           throw resp;
//         }
//         setAuthorized(true);
//         await listUpcomingEvents();
//       },
//     });

//     if (gapi.client.getToken() === null) {
//       tokenClient.requestAccessToken({ prompt: "consent" });
//     } else {
//       tokenClient.requestAccessToken({ prompt: "" });
//     }
//   };

//   const handleSignoutClick = () => {
//     // @ts-expect-error - Google API types are not fully available
//     const token = gapi.client.getToken();
//     if (token) {
//       // @ts-expect-error - Google API types are not fully available
//       window.google.accounts.oauth2.revoke(token.access_token);
//       gapi.client.setToken("");
//       setEvents([]);
//       setAuthorized(false);
//     }
//   };

//   const listUpcomingEvents = async () => {
//     try {
//       setLoading(true);
//       const response = await gapi.client.calendar.events.list({
//         calendarId: "primary",
//         timeMin: new Date().toISOString(),
//         showDeleted: false,
//         singleEvents: true,
//         maxResults: 10,
//         orderBy: "startTime",
//       });

//       const newEvents = response.result.items;
//       if (newEvents && newEvents.length > 0) {
//         setEvents(newEvents as GoogleCalendarEvent[]);
//         if (onEventsLoaded) {
//           onEventsLoaded(newEvents as GoogleCalendarEvent[]);
//         }
//         console.log("Events from Google Calendar:", newEvents); // Log the events
//       } else {
//         setEvents([]);
//         if (onEventsLoaded) {
//           onEventsLoaded([]);
//         }
//         console.log("No upcoming events found.");
//       }
//     } catch (error) {
//       console.error("Error fetching upcoming events:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (authorized) {
//       listUpcomingEvents();
//     }
//   }, [authorized]);

//   return (
//     <div className="flex flex-col items-center justify-center py-2">
//       <main className="flex flex-col items-center justify-center w-full flex-1 px-4 md:px-20 text-center">
//         <h2 className="text-2xl md:text-3xl font-bold mb-6">
//           Sync with Your Google Calendar
//         </h2>
//         {!gapiReady || !gisReady ? (
//           <div className="flex items-center space-x-2">
//             <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
//             <p>Loading Google API...</p>
//           </div>
//         ) : !authorized ? (
//           <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
//             <input
//               type="text"
//               placeholder="Google API Key"
//               className="border rounded p-2 mb-2 w-full"
//               value={apiKey}
//               onChange={(e) => setApiKey(e.target.value)}
//             />
//             <input
//               type="text"
//               placeholder="Google Client ID"
//               className="border rounded p-2 mb-4 w-full"
//               value={clientId}
//               onChange={(e) => setClientId(e.target.value)}
//             />
//             <button
//               className="bg-primary hover:bg-primary/90 text-white bg-blue-500 font-bold py-2 px-4 rounded w-full"
//               onClick={handleAuthClick}
//             >
//               Connect Calendar
//             </button>
//           </div>
//         ) : (
//           <div className="w-full max-w-md">
//             {loading ? (
//               <div className="flex items-center justify-center space-x-2">
//                 <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
//                 <p>Loading events...</p>
//               </div>
//             ) : (
//               <button
//                 className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
//                 onClick={handleSignoutClick}
//               >
//                 Disconnect Calendar
//               </button>
//             )}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

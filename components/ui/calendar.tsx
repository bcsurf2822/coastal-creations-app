// "use client";

// import { useEffect, useState } from "react";

// // Discovery doc URL for APIs used by the quickstart
// const DISCOVERY_DOC =
//   "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

// // Authorization scopes required by the API; multiple scopes can be
// // included, separated by spaces.
// const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// interface CalendarEvent {
//   id: string;
//   summary: string;
//   start: {
//     dateTime: string;
//     date: string;
//   };
// }

// export default function Home() {
//   const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const [gapiReady, setGapiReady] = useState(false);
//   const [gisReady, setGisReady] = useState(false);
//   const [authorized, setAuthorized] = useState(false);
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
//       // @ts-expect-error
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
//       gapi.client.getToken() ? setAuthorized(true) : setAuthorized(false);
//     } catch (error: any) {
//       console.error("Error initializing Google API client:", error);
//     }
//   };

//   const handleAuthClick = async () => {
//     // @ts-expect-error
//     const tokenClient = window.google.accounts.oauth2.initTokenClient({
//       client_id: clientId,
//       scope: SCOPES,
//       callback: async (resp: any) => {
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
//     // @ts-expect-error
//     const token = gapi.client.getToken();
//     if (token) {
//       // @ts-expect-error
//       window.google.accounts.oauth2.revoke(token.access_token);
//       gapi.client.setToken("");
//       setEvents([]);
//       setAuthorized(false);
//     }
//   };

//   const listUpcomingEvents = async () => {
//     try {
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
//         setEvents(newEvents as CalendarEvent[]);
//         console.log("Events from Google Calendar:", newEvents); // Log the events
//       } else {
//         setEvents([]);
//         console.log("No upcoming events found.");
//       }
//     } catch (error: any) {
//       console.error("Error fetching upcoming events:", error);
//     }
//   };

//   useEffect(() => {
//     if (authorized) {
//       listUpcomingEvents();
//     }
//   }, [authorized]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen py-2">
//       <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
//         <h1 className="text-6xl font-bold">Eventide Calendar</h1>
//         {!gapiReady || !gisReady ? (
//           <p>Loading Google API...</p>
//         ) : !authorized ? (
//           <>
//             <input
//               type="text"
//               placeholder="Google API Key"
//               className="border rounded p-2 mb-2 w-full max-w-md"
//               value={apiKey}
//               onChange={(e) => setApiKey(e.target.value)}
//             />
//             <input
//               type="text"
//               placeholder="Google Client ID"
//               className="border rounded p-2 mb-2 w-full max-w-md"
//               value={clientId}
//               onChange={(e) => setClientId(e.target.value)}
//             />
//             <button
//               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//               onClick={handleAuthClick}
//             >
//               Authorize
//             </button>
//           </>
//         ) : (
//           <>
//             <button
//               className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
//               onClick={handleSignoutClick}
//             >
//               Sign Out
//             </button>
//             {/* No components, just API call */}
//           </>
//         )}
//       </main>
//     </div>
//   );
// }

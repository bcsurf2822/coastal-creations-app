# Event Options Removal Fix Tasks

## Problem Statement

When editing an event and removing options, the options persist after saving.

## Tasks

- [x] Examine the PATCH route implementation in `app/api/event/[id]/route.ts`
- [x] Review the Event model in `lib/models/Event.ts` to understand options structure
- [x] Analyze the EditEvent component implementation in `components/dashboard/EditEvent.tsx`
- [x] Use MongoDB tools to view current event data structure
- [x] Test PATCH functionality with events having multiple options
- [x] Identify and fix the issue with options removal
- [x] Verify the fix works for all scenarios
- [x] Improve the EditEvent component UI using Material UI

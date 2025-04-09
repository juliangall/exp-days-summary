# Product Requirements Document (PRD)
# Training Course Attendance Spreadsheet Web Application

## 1. Overview

### 1.1 Purpose
This web application retrieves event and attendee data from the TicketTailor API and displays it as a spreadsheet. The spreadsheet shows attendees (rows) and training course events (columns), with a "1" indicating attendance and a blank indicating non-attendance. The goal is to provide a simple tool for tracking attendance across training courses.

### 1.2 Business Objective
Enable one or two training coordinators to easily visualize and export a list of attendees across multiple training events for planning and reporting purposes.

### 1.3 Target Users
Primary users: 1-2 training coordinators or administrators.

Usage: Standalone web app, no integration with other systems.

## 2. Functional Requirements

### 2.1 Data Retrieval
API Endpoints:
- Get All Events: `GET https://api.tickettailor.com/v1/events`
  - Fetch all events with a hard-coded filter: start_at date (e.g., "2025-01-01"). This can be updated in the code later if needed.
  - Relevant fields: id (event ID), title (event name).
- Get All Issued Tickets: `GET https://api.tickettailor.com/v1/issued_tickets?event_id={event_id}`
  - Fetch tickets for each event retrieved above.
  - Relevant fields: attendee_first_name, attendee_last_name, attendee_email, event_id.

Authentication: Use a pre-configured API key stored in the application (e.g., in an environment variable or config file).

Pagination: Handle pagination to retrieve all events and tickets (expected volume is small, but still required for API compliance).

### 2.2 Data Processing
Events: Create a list of events (10-20 expected) to define spreadsheet columns.

Attendees: Create a unique list of attendees (up to 50 expected) based on attendee_email.
- Combine attendee_first_name and attendee_last_name into a full name (e.g., "John Doe").

Attendance Matrix: Build a 2D grid where:
- Rows = unique attendees (identified by attendee_email).
- Columns = events.
- Cell value = 1 if the attendee has a ticket for the event, blank otherwise.

### 2.3 Spreadsheet Display
UI: A simple, responsive HTML table.

Structure:
- First column: Attendee full name.
- Subsequent columns: Event titles (e.g., "Training Course A").
- Rows: One per unique attendee (up to 50 total).
- Cells: Display 1 for attendance, blank otherwise.

Features:
- Sortable by attendee name (ascending/descending).
- Horizontal scrolling if more than 10-20 events are displayed.

### 2.4 Export Functionality
Export to CSV: Provide a button to download the spreadsheet as a .csv file.
Format: "Attendee","Event A","Event B","Event C"
"John Doe","1","","1"
"Jane Smith","","1",""

## 3. Non-Functional Requirements
- Performance: Handle 10-20 events and up to 50 attendees efficiently (fetch data asynchronously).
- Security: Pre-configured API key stored securely (e.g., .env file, not exposed in client-side code).
- Scalability: Designed for small-scale use (1-2 users, max 50 attendees).
- Usability: Minimalist interface with a "Refresh Data" button to re-fetch API data.
- Deployment: Standalone web app, hosted on a static site (e.g., Netlify) or simple server.

## 4. Technical Specifications

### 4.1 Architecture
Client-Side Only:
- Built with HTML/CSS/JavaScript (Vanilla JS or lightweight framework like React).
- Use fetch API to call TicketTailor endpoints directly.
- API Key: Stored in a .env file or equivalent, accessed via build tools (e.g., Vite or Webpack).

### 4.2 Data Flow
1. App loads and uses the pre-configured API key.
2. Fetch events from /v1/events with start_at filter.
3. For each event, fetch tickets from /v1/issued_tickets.
4. Process data into an attendance matrix.
5. Render the spreadsheet in the UI.
6. Enable CSV export.

### 4.3 UI Mockup
| Attendee | Event A | Event B | Event C |
| John Doe | 1 | | 1 |
| Jane Smith | | 1 | |
[Refresh Data] [Export to CSV]

## 5. Assumptions
- Event Volume: 10-20 events, each with up to 8 attendees, totaling no more than 50 unique attendees.
- Attendee Data: Only attendee_first_name, attendee_last_name, and attendee_email are needed; no additional fields required.
- Start Date: Hard-coded start_at (e.g., "2025-01-01") is sufficient for now.
- Usage: No real-time updates; manual refresh is acceptable.

## 6. Deliverables
Web Application:
- Responsive HTML table displaying the attendance matrix.
- "Refresh Data" button to re-fetch from API.
- "Export to CSV" button for downloading the data.
- Source Code: JavaScript-based, with API key configuration.
- Deployment: Hosted as a standalone app (e.g., Netlify).

## 7. Timeline (Estimated)
Development: 1-2 weeks for a minimal viable product (MVP).
- Setup and API integration: 2-3 days.
- Data processing and UI: 2-3 days.
- Testing and deployment: 1-2 days.
- Testing: Manual testing with sample API data (mock or real).

## 8. Success Criteria
- App correctly displays 10-20 events and up to 50 attendees in a spreadsheet.
- Attendance is accurately marked with "1" or blank.
- CSV export matches the on-screen data.
- Usable by 1-2 coordinators with minimal training.

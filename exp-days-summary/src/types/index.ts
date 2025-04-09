export interface Event {
    id: string;
    name: string;
    start_at: string;
}

export interface Attendee {
    email: string;
    firstName: string;
    lastName: string;
}

export interface Ticket {
    id: string;
    event_id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    status: string;
    voided_at: null | string;
}

export interface AttendanceMatrix {
    attendees: {
        [email: string]: {
            fullName: string;
            attendance: { [eventId: string]: boolean };
        };
    };
    events: Event[];
} 
export interface TicketType {
    id: string;
    name: string;
    quantity_total: number;
}

export interface Event {
    id: string;
    name: string;
    start: {
        date: string;  // Format: "YYYY-MM-DD"
        time: string;
        timezone: string;
    };
    end?: {
        date: string;
        time: string;
        timezone: string;
    };
    total_issued_tickets: number;
    ticket_types: TicketType[];
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
    voided_at: string | null;
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
export interface TicketType {
    id: string;
    name: string;
    quantity_total: number;
    quantity_issued?: number;
    sort_order?: number;
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
    ticket_type_id?: string | null;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    status: string;
    voided_at: string | null;
}

export interface AttendanceColumn extends Event {
    event_id: string;
    ticket_type_id?: string;
    session_name?: string;
}

export interface AttendanceMatrix {
    attendees: {
        [email: string]: {
            fullName: string;
            attendance: { [eventId: string]: boolean };
        };
    };
    events: AttendanceColumn[];
}

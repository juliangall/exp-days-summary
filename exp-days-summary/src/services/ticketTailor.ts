import axios from 'axios';
import { Event, Ticket, AttendanceMatrix } from '../types';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL
});

export const getEvents = async (startDate: string = '2026-01-01'): Promise<Event[]> => {
    try {
        const timestamp = Math.floor(new Date(startDate).getTime() / 1000);
        console.log('Requesting events with timestamp:', timestamp);
        
        const response = await api.get('/events', {
            params: {
                'start_at': timestamp
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const getTickets = async (eventId: string): Promise<Ticket[]> => {
    try {
        const response = await api.get(`/tickets`, {
            params: {
                'event_id': eventId
            }
        });
        
        if (!response.data.data) {
            return [];
        }

        const tickets = response.data.data;
        console.log(`Got ${tickets.length} tickets for event ${eventId}`);
        return tickets;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
};

export const buildAttendanceMatrix = (events: Event[], tickets: Ticket[]): AttendanceMatrix => {
    console.log('Building matrix with events:', events.map(e => ({ id: e.id, name: e.name })));
    console.log('Processing tickets:', tickets.map(t => ({ 
        event_id: t.event_id, 
        email: t.email, 
        full_name: t.full_name,
        status: t.status,
        voided_at: t.voided_at
    })));

    const matrix: AttendanceMatrix = {
        attendees: {},
        events: events
    };

    // Filter out invalid tickets
    const validTickets = tickets.filter(ticket => {
        const isValid = ticket.status === 'valid' && 
            !ticket.voided_at &&
            ticket.email &&
            ticket.full_name;
        console.log(`Ticket ${ticket.full_name} for event ${ticket.event_id}:`, {
            status: ticket.status,
            voided_at: ticket.voided_at,
            email: ticket.email,
            isValid
        });
        return isValid;
    });

    // First, create entries for all attendees
    validTickets.forEach(ticket => {
        const email = ticket.email;
        if (!matrix.attendees[email]) {
            matrix.attendees[email] = {
                fullName: ticket.full_name,
                attendance: {}
            };
            // Initialize all events as false
            events.forEach(event => {
                matrix.attendees[email].attendance[event.id] = false;
            });
        }
    });

    // Then mark attendance for each ticket
    validTickets.forEach(ticket => {
        const email = ticket.email;
        matrix.attendees[email].attendance[ticket.event_id] = true;
        console.log(`Marking attendance for ${ticket.full_name} (${email}) at event ${ticket.event_id}`);
    });

    // Sort attendees by name
    const sortedAttendees: { [email: string]: any } = {};
    Object.keys(matrix.attendees)
        .sort((a, b) => matrix.attendees[a].fullName.localeCompare(matrix.attendees[b].fullName))
        .forEach(email => {
            sortedAttendees[email] = matrix.attendees[email];
        });

    matrix.attendees = sortedAttendees;

    console.log('Final matrix:', {
        events: events.length,
        attendees: Object.keys(matrix.attendees).length,
        sampleAttendee: Object.entries(matrix.attendees)[0]
    });

    return matrix;
}; 
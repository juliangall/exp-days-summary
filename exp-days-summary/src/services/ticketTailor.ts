import axios from 'axios';
import { Event, Ticket, AttendanceMatrix } from '../types';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL
});

export const getEvents = async (startDate: string = '2025-01-01'): Promise<Event[]> => {
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
    const matrix: AttendanceMatrix = {
        attendees: {},
        events: events
    };

    // Filter out invalid tickets
    const validTickets = tickets.filter(ticket => 
        ticket.status === 'valid' && 
        !ticket.voided_at &&
        ticket.email &&
        ticket.full_name
    );

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
    });

    // Sort attendees by name
    const sortedAttendees: { [email: string]: any } = {};
    Object.keys(matrix.attendees)
        .sort((a, b) => matrix.attendees[a].fullName.localeCompare(matrix.attendees[b].fullName))
        .forEach(email => {
            sortedAttendees[email] = matrix.attendees[email];
        });

    matrix.attendees = sortedAttendees;

    console.log('Matrix built:', {
        events: events.length,
        attendees: Object.keys(matrix.attendees).length,
        firstAttendee: Object.entries(matrix.attendees)[0]
    });

    return matrix;
}; 
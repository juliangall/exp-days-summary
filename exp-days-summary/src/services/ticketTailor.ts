import axios from 'axios';
import type { Event, Ticket } from '../types';
import { fetchAllPages } from './pagination';
import type { TicketTailorPage } from './pagination';
export { buildAttendanceMatrix } from './attendance';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL
});

export const getEvents = async (startDate: string = '2026-01-01'): Promise<Event[]> => {
    try {
        // Fetch all events from the API
        const events = await fetchAllPages<Event>(async params => {
            const response = await api.get<TicketTailorPage<Event>>('/events', { params });
            return response.data;
        });
        console.log('Total events received from API:', events.length);
        
        // Filter events on the client side to only include those after startDate
        const cutoffDate = new Date(startDate);
        const filteredEvents = events.filter((event: Event) => {
            const eventDate = new Date(event.start.date);
            console.log(`Event: ${event.name}, Date: ${event.start.date}, After cutoff: ${eventDate >= cutoffDate}`);
            return eventDate >= cutoffDate;
        });
        
        // Sort events chronologically by date
        filteredEvents.sort((a: Event, b: Event) => {
            const dateA = new Date(a.start.date).getTime();
            const dateB = new Date(b.start.date).getTime();
            return dateA - dateB;
        });
        
        console.log(`Filtered to ${filteredEvents.length} events after ${startDate}`);
        return filteredEvents;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

export const getTickets = async (eventId: string): Promise<Ticket[]> => {
    try {
        const tickets = await fetchAllPages<Ticket>(async params => {
            const response = await api.get<TicketTailorPage<Ticket>>('/tickets', { params });
            return response.data;
        }, { event_id: eventId });
        console.log(`Got ${tickets.length} tickets for event ${eventId}`);
        return tickets;
    } catch (error) {
        console.error('Error fetching tickets:', error);
        throw error;
    }
};

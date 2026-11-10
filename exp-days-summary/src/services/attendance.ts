import type { AttendanceColumn, AttendanceMatrix, Event, Ticket } from '../types/index.ts';

// These events sell separate sessions as ticket types. Other events may have
// multiple price categories for the same session, so keep those together.
export const SESSION_EVENT_IDS: ReadonlySet<string> = new Set(['ev_8952588']);

export const buildAttendanceMatrix = (events: Event[], tickets: Ticket[]): AttendanceMatrix => {
    const validTickets = tickets.filter(ticket => ticket.status === 'valid' && !ticket.voided_at);
    const columns: AttendanceColumn[] = events.flatMap(event => {
        if (!SESSION_EVENT_IDS.has(event.id)) {
            return [{ ...event, event_id: event.id }];
        }

        if (event.ticket_types.length === 0) {
            throw new Error(`No sessions found for ${event.name}`);
        }

        return [...event.ticket_types]
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map(type => ({
                ...event,
                id: `${event.id}:${type.id}`,
                event_id: event.id,
                ticket_type_id: type.id,
                session_name: type.name,
                ticket_types: [type],
                total_issued_tickets: type.quantity_issued ?? validTickets.filter(ticket =>
                    ticket.event_id === event.id && ticket.ticket_type_id === type.id
                ).length,
            }));
    });

    const matrix: AttendanceMatrix = { attendees: {}, events: columns };
    const eventIds = new Set(events.map(event => event.id));
    const columnIds = new Set(columns.map(column => column.id));

    for (const ticket of validTickets) {
        if (!eventIds.has(ticket.event_id)) continue;

        const columnId = SESSION_EVENT_IDS.has(ticket.event_id)
            ? `${ticket.event_id}:${ticket.ticket_type_id}`
            : ticket.event_id;
        if (!columnIds.has(columnId)) {
            throw new Error('A booked ticket could not be matched to a session. Please refresh the data.');
        }
        if (!ticket.email || !ticket.full_name) continue;

        if (!matrix.attendees[ticket.email]) {
            matrix.attendees[ticket.email] = {
                fullName: ticket.full_name,
                attendance: Object.fromEntries(columns.map(column => [column.id, false])),
            };
        }
        matrix.attendees[ticket.email].attendance[columnId] = true;
    }

    matrix.attendees = Object.fromEntries(Object.entries(matrix.attendees)
        .sort(([, a], [, b]) => a.fullName.localeCompare(b.fullName)));
    console.log('Built attendance matrix:', { events: events.length, columns: columns.length,
        attendees: Object.keys(matrix.attendees).length });
    return matrix;
};

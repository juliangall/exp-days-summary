import React from 'react';
import { AttendanceMatrix, Event } from '../types';

interface Props {
    data: AttendanceMatrix;
    futureOnly: boolean;
    onFutureOnlyChange: (value: boolean) => void;
    onExport: () => void;
    onRefresh: () => void;
}

export const AttendanceTable: React.FC<Props> = ({
    data,
    futureOnly,
    onFutureOnlyChange,
    onExport,
    onRefresh,
}) => {
    console.log('AttendanceTable rendered with data:', data);

    // Function to format the date
    const formatDate = (event: Event) => {
        try {
            const dateString = event.start.date;
            const [year, month, day] = dateString.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const formattedDay = date.getDate().toString().padStart(2, '0');
            const formattedMonth = date.toLocaleString('en-US', { month: 'short' });
            return `${formattedDay}-${formattedMonth}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const getTotalTickets = (event: Event) => {
        console.log('getTotalTickets called for event:', event.name);
        const total = event.ticket_types.reduce((sum, type) => sum + type.quantity_total, 0);
        console.log(`Received ${total} total tickets for ${event.name}`);
        return total;
    };

    return (
        <div className="attendance-container">
            <div className="controls">
                <button onClick={onRefresh}>Refresh Data</button>
                <button onClick={onExport}>Export to CSV</button>
                <label className="toggle">
                    <input
                        type="checkbox"
                        role="switch"
                        checked={futureOnly}
                        onChange={event => onFutureOnlyChange(event.target.checked)}
                    />
                    <span className="toggle-track" aria-hidden="true" />
                    <span>Future courses only</span>
                </label>
            </div>
            {data.events.length === 0 ? (
                <div className="table-container empty-state">
                    No future courses.
                </div>
            ) : (
            <div className="table-container">
                <table>
                    <thead>
                        {/* Course name and date live in a single header row so it
                            can stick to the top as one unit. */}
                        <tr>
                            <th className="attendee-header">Attendee</th>
                            {data.events.map(event => (
                                <th key={event.id} className="event-header" scope="col">
                                    <span className="event-name">{event.name}</span>
                                    <span className="event-date">{formatDate(event)}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data.attendees).map(([email, info]) => (
                            <tr key={email}>
                                <th className="attendee-cell" scope="row">{info.fullName}</th>
                                {data.events.map(event => (
                                    <td key={event.id} className="attendance-cell">
                                        {info.attendance[event.id] ? '1' : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="ticket-count">
                            <th className="attendee-cell" scope="row">Total Tickets</th>
                            {data.events.map(event => {
                                console.log('Rendering ticket count for event:', event.name);
                                const total = getTotalTickets(event);
                                return (
                                    <td key={`count-${event.id}`}>
                                        {event.total_issued_tickets}/{total}
                                    </td>
                                );
                            })}
                        </tr>
                    </tfoot>
                </table>
            </div>
            )}
        </div>
    );
};

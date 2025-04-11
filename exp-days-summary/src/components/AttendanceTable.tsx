import React from 'react';
import { AttendanceMatrix, Event } from '../types';

interface Props {
    data: AttendanceMatrix;
    onExport: () => void;
    onRefresh: () => void;
}

export const AttendanceTable: React.FC<Props> = ({ data, onExport, onRefresh }) => {
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
            </div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th rowSpan={2}>Attendee</th>
                            {data.events.map(event => (
                                <th key={event.id}>{event.name}</th>
                            ))}
                        </tr>
                        <tr>
                            {data.events.map(event => (
                                <th key={`date-${event.id}`} className="date-header">
                                    {formatDate(event)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data.attendees).map(([email, info]) => (
                            <tr key={email}>
                                <td>{info.fullName}</td>
                                {data.events.map(event => (
                                    <td key={event.id}>
                                        {info.attendance[event.id] ? '1' : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="ticket-count">
                            <td>Total Tickets</td>
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
                    </tbody>
                </table>
            </div>
        </div>
    );
}; 
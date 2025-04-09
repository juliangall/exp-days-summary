import React from 'react';
import { AttendanceMatrix } from '../types';

interface Props {
    data: AttendanceMatrix;
    onExport: () => void;
    onRefresh: () => void;
}

export const AttendanceTable: React.FC<Props> = ({ data, onExport, onRefresh }) => {
    // Function to format the date
    const formatDate = (event: Event) => {
        try {
            // Access the date string from event.start.date
            const dateString = event.start.date;
            const [year, month, day] = dateString.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const formattedDay = date.getDate().toString().padStart(2, '0');
            const formattedMonth = date.toLocaleString('en-US', { month: 'short' });
            return `${formattedDay}-${formattedMonth}`;
        } catch (error) {
            console.error('Error formatting date:', event.start.date, error);
            return 'Invalid Date';
        }
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
                    </tbody>
                </table>
            </div>
        </div>
    );
}; 
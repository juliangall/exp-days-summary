import type { AttendanceMatrix } from '../types/index.ts';

export const buildAttendanceCsv = (data: AttendanceMatrix): string => {
    const rows = [
        ['Attendee', ...data.events.map(event => event.session_name
            ? `${event.name}: ${event.session_name}` : event.name)],
        ['', ...data.events.map(event => {
            const [year, month, day] = event.start.date.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return `${String(day).padStart(2, '0')}-${date.toLocaleString('en-US', { month: 'short' })}`;
        })],
        ...Object.values(data.attendees).map(info => [
            info.fullName, ...data.events.map(event => info.attendance[event.id] ? '1' : ''),
        ]),
    ];
    // Session titles include commas; quote fields so exports keep one column
    // per session even when titles or attendee names contain CSV delimiters.
    return rows.map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
};

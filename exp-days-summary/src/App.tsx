import { useState, useEffect, useMemo } from 'react'
import { AttendanceTable } from './components/AttendanceTable'
import { getEvents, getTickets, buildAttendanceMatrix } from './services/ticketTailor'
import { AttendanceMatrix, Ticket, Event } from './types'
import './App.css'

function App() {
  const [attendanceData, setAttendanceData] = useState<AttendanceMatrix | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [futureOnly, setFutureOnly] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const events = await getEvents()
      console.log('Events received:', events)
      
      if (!events || events.length === 0) {
        throw new Error('No events found')
      }

      const allTickets: Ticket[] = []
      
      for (const event of events) {
        console.log(`Fetching tickets for event: ${event.name} (${event.id})`)
        try {
          const tickets = await getTickets(event.id)
          console.log(`Received ${tickets.length} issued tickets for ${event.name}`)
          console.log(`Received ${event.ticket_types.reduce((sum, type) => sum + type.quantity_total, 0)} total tickets for ${event.name}`)
          if (tickets && tickets.length > 0) {
            allTickets.push(...tickets)
          }
        } catch (err) {
          console.error(`Error fetching tickets for event ${event.name}:`, err)
        }
      }

      console.log(`Total tickets collected: ${allTickets.length}`)
      
      if (allTickets.length === 0) {
        throw new Error('No tickets found for any events')
      }

      const matrix = buildAttendanceMatrix(events, allTickets)
      console.log('Final matrix:', {
        events: matrix.events.length,
        attendees: Object.keys(matrix.attendees).length,
        sampleAttendee: Object.entries(matrix.attendees)[0]
      })
      
      setAttendanceData(matrix)
    } catch (err) {
      console.error('Error in fetchData:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Events use "YYYY-MM-DD", so a string comparison is both correct and immune
  // to the UTC-midnight parsing that `new Date('YYYY-MM-DD')` would introduce.
  const todayIso = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  };

  // The view the table and the CSV export both render: when the toggle is on,
  // drop past courses and any attendee left with nothing to attend.
  const visibleData = useMemo(() => {
    if (!attendanceData || !futureOnly) return attendanceData;

    const today = todayIso();
    const events = attendanceData.events.filter(event => event.start.date >= today);
    const attendees = Object.fromEntries(
      Object.entries(attendanceData.attendees)
        .filter(([, info]) => events.some(event => info.attendance[event.id]))
    );

    console.log(`Future-only filter: ${events.length}/${attendanceData.events.length} events, ` +
      `${Object.keys(attendees).length}/${Object.keys(attendanceData.attendees).length} attendees`);

    return { events, attendees };
  }, [attendanceData, futureOnly])

  const handleExport = () => {
    if (!visibleData) return;

    const formatDate = (event: Event) => {
        const dateString = event.start.date;
        const [year, month, day] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const formattedDay = date.getDate().toString().padStart(2, '0');
        const formattedMonth = date.toLocaleString('en-US', { month: 'short' });
        return `${formattedDay}-${formattedMonth}`;
    };

    // Create headers with course names and dates
    const headers = [
        ['Attendee', ...visibleData.events.map(event => event.name)],
        ['', ...visibleData.events.map(event => formatDate(event))]
    ];

    // Create rows with attendee data
    const rows = Object.entries(visibleData.attendees).map(([, info]) => {
        return [
            info.fullName,
            ...visibleData.events.map(event => info.attendance[event.id] ? '1' : '')
        ];
    });

    // Combine headers and rows
    const csvContent = [
        ...headers.map(row => row.join(',')),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = futureOnly ? 'attendance-future.csv' : 'attendance.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading...</div>
  if (error) return <div className="error">{error}</div>
  if (!attendanceData || !visibleData) return <div>No data available</div>

  return (
    <div className="app">
      <h1>Experience Day Attendance</h1>
      <AttendanceTable 
        data={visibleData}
        futureOnly={futureOnly}
        onFutureOnlyChange={setFutureOnly}
        onExport={handleExport}
        onRefresh={fetchData}
      />
    </div>
  )
}

export default App

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildAttendanceMatrix } from '../src/services/attendance.ts';
import { buildAttendanceCsv } from '../src/services/attendanceCsv.ts';
import { fetchAllPages } from '../src/services/pagination.ts';

const showcase = {
    id: 'ev_8952588', name: 'Rob Cosman SFWW Showcase',
    start: { date: '2026-11-17', time: '10:00', timezone: '+00:00' },
    total_issued_tickets: 140,
    ticket_types: [
        { id: 'morning', name: 'Morning 10am - Sharpening, plane setup & shooting board', quantity_total: 80, quantity_issued: 44, sort_order: 1 },
        { id: 'afternoon', name: 'Afternoon 2pm - Through dovetails', quantity_total: 80, quantity_issued: 51, sort_order: 2 },
        { id: 'evening', name: 'Evening 6pm - Half-blind dovetails', quantity_total: 80, quantity_issued: 45, sort_order: 3 },
    ],
};
const ticket = (id, type, extra = {}) => ({
    id, event_id: showcase.id, ticket_type_id: type, email: 'sample@example.com',
    full_name: 'Sample Attendee', first_name: 'Sample', last_name: 'Attendee',
    status: 'valid', voided_at: null, ...extra,
});

test('Showcase has three ordered session columns, each with its own capacity and issued total', () => {
    const matrix = buildAttendanceMatrix([{ ...showcase, ticket_types: [...showcase.ticket_types].reverse() }], []);
    assert.deepEqual(matrix.events.map(e => [e.ticket_type_id, e.total_issued_tickets, e.ticket_types[0].quantity_total]),
        [['morning', 44, 80], ['afternoon', 51, 80], ['evening', 45, 80]]);
    assert.ok(matrix.events.every(e => e.event_id === showcase.id && e.start.date === '2026-11-17'));
});

test('one attendee can book several sessions without marking the remaining session', () => {
    const matrix = buildAttendanceMatrix([showcase], [ticket('1', 'morning'), ticket('2', 'evening'), ticket('3', 'morning')]);
    assert.equal(Object.keys(matrix.attendees).length, 1);
    assert.deepEqual(Object.values(matrix.attendees['sample@example.com'].attendance), [true, false, true]);
});

test('voided and invalid tickets do not mark attendance; missing attendee details still count as issued', () => {
    const event = { ...showcase, ticket_types: showcase.ticket_types.map(({ quantity_issued, ...type }) => type) };
    const matrix = buildAttendanceMatrix([event], [
        ticket('1', 'morning'), ticket('2', 'afternoon', { status: 'voided' }),
        ticket('3', 'evening', { voided_at: 123 }), ticket('4', 'morning', { email: '' }),
    ]);
    assert.deepEqual(Object.values(matrix.attendees['sample@example.com'].attendance), [true, false, false]);
    assert.deepEqual(matrix.events.map(e => e.total_issued_tickets), [2, 0, 0]);
});

test('ordinary events keep a single column even with several ticket price categories', () => {
    const event = { ...showcase, id: 'barbecue', name: 'Summer Barbecue' };
    const matrix = buildAttendanceMatrix([event], [ticket('1', 'morning', { event_id: event.id })]);
    assert.equal(matrix.events.length, 1);
    assert.equal(matrix.events[0].id, 'barbecue');
    assert.equal(matrix.events[0].total_issued_tickets, 140);
    assert.equal(matrix.attendees['sample@example.com'].attendance.barbecue, true);
});

test('unmatched session tickets fail visibly rather than produce misleading attendance', () => {
    assert.throws(() => buildAttendanceMatrix([showcase], [ticket('1', null)]), /could not be matched/);
    assert.throws(() => buildAttendanceMatrix([{ ...showcase, ticket_types: [] }], []), /No sessions/);
});

test('CSV has separate session headers, escapes punctuation, and matches attendance', () => {
    const matrix = buildAttendanceMatrix([showcase], [ticket('1', 'afternoon', { full_name: 'Sample, "Guest"' })]);
    const csv = buildAttendanceCsv(matrix).split('\n');
    assert.ok(csv[0].includes('"Rob Cosman SFWW Showcase: Morning 10am - Sharpening, plane setup & shooting board"'));
    assert.equal(csv[1], '"","17-Nov","17-Nov","17-Nov"');
    assert.equal(csv[2], '"Sample, ""Guest""","","1",""');
});

test('pagination includes bookings beyond the first 100, retaining the event filter', async () => {
    const calls = [];
    const tickets = await fetchAllPages(async params => {
        calls.push(params);
        return params.starting_after
            ? { data: [ticket('101', 'evening')], links: { next: null } }
            : { data: Array.from({ length: 100 }, (_, i) => ticket(String(i), 'morning')), links: {
                next: '/issued_tickets/?starting_after=99&event_id=ev_8952588&limit=100',
            } };
    }, { event_id: showcase.id });
    assert.equal(tickets.length, 101);
    assert.equal(calls[1].event_id, showcase.id);
    assert.equal(calls[1].starting_after, '99');
    const matrix = buildAttendanceMatrix([showcase], tickets);
    assert.equal(matrix.attendees['sample@example.com'].attendance[`${showcase.id}:evening`], true);
});

test('pagination propagates failures and rejects malformed or repeated pages', async () => {
    await assert.rejects(fetchAllPages(async () => { throw new Error('Unavailable'); }), /Unavailable/);
    await assert.rejects(fetchAllPages(async () => ({})), /Invalid Ticket Tailor response/);
    await assert.rejects(fetchAllPages(async () => ({ data: [], links: { next: '/events?starting_after=same' } })), /repeated page/);
});

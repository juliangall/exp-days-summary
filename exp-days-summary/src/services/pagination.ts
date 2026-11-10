export interface TicketTailorPage<T> {
    data: T[];
    links?: { next?: string | null };
}

// Follow the upstream cursor through our proxy, whose route names differ from
// Ticket Tailor's. Never send a browser request directly to the upstream URL.
export const fetchAllPages = async <T>(
    fetchPage: (params: Record<string, string>) => Promise<TicketTailorPage<T>>,
    params: Record<string, string> = {},
): Promise<T[]> => {
    const items: T[] = [];
    const seen = new Set<string>();
    let pageParams = { ...params };
    while (true) {
        const page = await fetchPage(pageParams);
        if (!Array.isArray(page.data)) throw new Error('Invalid Ticket Tailor response');
        items.push(...page.data);
        const next = page.links?.next;
        if (!next) return items;
        if (seen.has(next)) throw new Error('Ticket Tailor returned a repeated page');
        seen.add(next);
        pageParams = { ...params, ...Object.fromEntries(new URL(next, 'https://api.tickettailor.com').searchParams) };
    }
};

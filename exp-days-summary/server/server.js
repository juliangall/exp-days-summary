import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: ['https://juliangall.github.io', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const API_KEY = process.env.TICKET_TAILOR_API_KEY;
const BASE_URL = 'https://api.tickettailor.com/v1';

const hashed = Buffer.from(API_KEY).toString('base64');

const ticketTailorApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Basic ${hashed}`,
        'Accept': 'application/json'
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const response = await ticketTailorApi.get('/events', {
            params: req.query
        });
        console.log('First event data:', JSON.stringify(response.data.data[0], null, 2));
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tickets', async (req, res) => {
    try {
        const response = await ticketTailorApi.get('/issued_tickets', {
            params: req.query
        });
        console.log('Sample ticket data:', JSON.stringify(response.data.data[0], null, 2));
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 
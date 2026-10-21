import axios from 'axios';
import type { HttpTransport } from './contracts.mjs';

export const httpTransport: HttpTransport = {
    async get(url) {
        const response = await axios.get<unknown>(url);
        const body: unknown = response.data;
        return body;
    },
};

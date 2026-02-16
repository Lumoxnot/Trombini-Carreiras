import { createClient } from '@metagptx/web-sdk';
import { getAPIBaseURL } from './config';

// Create client instance
export const client = createClient({ baseURL: getAPIBaseURL() });

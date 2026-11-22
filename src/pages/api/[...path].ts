import type { APIRoute } from 'astro';
import { apiApp } from '../../api/app.ts';

export const ALL: APIRoute = ({ request }) => {
  return apiApp.fetch(request);
};

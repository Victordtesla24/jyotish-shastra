/**
 * Vercel Serverless Function Entry Point
 * Wraps Express app for Vercel serverless deployment
 */

import app from '../src/index.js';

export default async (req, res) => {
  return app(req, res);
};

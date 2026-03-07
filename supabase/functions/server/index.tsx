// Deno Edge runtime file: `npm:` specifiers and `Deno` globals are resolved by Supabase/Deno, not by the workspace TS server.
// @ts-ignore
import { Hono } from "npm:hono";
// @ts-ignore
import { cors } from "npm:hono/cors";
// @ts-ignore
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-bc073c98/health", (c: any) => {
  return c.json({ status: "ok" });
});

// @ts-ignore
Deno.serve(app.fetch);

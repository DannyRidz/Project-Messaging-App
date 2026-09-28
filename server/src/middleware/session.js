import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../db.js";

if (!process.env.SESSION_SECRET) {
  throw new Error("Set SESSION_SECRET in server/.env");
}

const PgSessionStore = connectPgSimple(session);
const isProduction = process.env.NODE_ENV === "production";

export const SESSION_COOKIE_NAME = "messaging.sid";

export const sessionCookieOptions = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: isProduction,
};

export const sessionMiddleware = session({
  name: SESSION_COOKIE_NAME,
  secret: process.env.SESSION_SECRET,
  store: new PgSessionStore({
    pool,
    tableName: "session",
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    ...sessionCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
});

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
export const sessionOptions = {
  cookieName: "admin_session",
  password: process.env.SESSION_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  },
};
export async function getSession() {
  return getIronSession(await cookies(), sessionOptions);
}
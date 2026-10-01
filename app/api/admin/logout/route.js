import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
export async function POST(request) {
  const response = Response.json({
    success: true,
    message: "Logout successful",
  });
  const session = await getIronSession(
    request,
    response,
    sessionOptions
  );
  session.destroy();
  return response;
}
import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(_req, _ctx) {
    const headers = new Headers();
    headers.set("Location", "/login");
    headers.set(
      "Set-Cookie",
      "authToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly",
    );

    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

export default function Logout() {
  return null;
}

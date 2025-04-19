import { Handlers } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";

export const handler: Handlers = {
  GET(req, _ctx) {
    const cookies = getCookies(req.headers);
    const authToken = cookies.authToken;

    const headers = new Headers();
    headers.set("Location", authToken ? "/editor" : "/login");

    return new Response(null, {
      status: 303,
      headers,
    });
  },
};

export default function Home() {
  return null;
}

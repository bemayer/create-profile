import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";

const STRAPI_URL = "http://localhost:1337";

interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface State {
  user?: User;
}

export async function handler(
  req: Request,
  ctx: FreshContext<State>,
) {
  const url = new URL(req.url);

  if (
    url.pathname.startsWith("/styles.css") ||
    url.pathname.startsWith("/_frsh/") ||
    url.pathname.startsWith("/favicon.ico") ||
    url.pathname.startsWith("/static/")
  ) {
    return await ctx.next();
  }

  if (
    url.pathname === "/login" ||
    url.pathname === "/register" ||
    url.pathname === "/logout"
  ) {
    return await ctx.next();
  }

  const cookies = getCookies(req.headers);
  const authToken = cookies.authToken;

  if (!authToken && url.pathname !== "/login" && url.pathname !== "/register") {
    const headers = new Headers();
    headers.set("Location", "/login");
    return new Response(null, {
      status: 303,
      headers,
    });
  }

  if (authToken) {
    try {
      const response = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        ctx.state.user = userData;
      } else {
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
      }
    } catch (error) {
      console.error("Error validating token:", error);
    }
  }

  return await ctx.next();
}

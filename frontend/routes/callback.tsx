import { Handlers, PageProps } from "$fresh/server.ts";

const STRAPI_URL = "http://localhost:1337";

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const provider = url.searchParams.get("provider");
    const accessToken = url.searchParams.get("access_token");

    if (!provider || !accessToken) {
      return new Response("Missing provider or access token", { status: 400 });
    }

    try {
      // Exchange the access token for a JWT from Strapi
      const response = await fetch(
        `${STRAPI_URL}/api/auth/${provider}/callback?access_token=${accessToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.jwt) {
        // Create a new response
        const resp = new Response("", {
          status: 303,
          headers: {
            Location: "/editor",
          },
        });

        // Set auth token in a cookie
        resp.headers.append(
          "Set-Cookie",
          `authToken=${data.jwt}; Path=/; HttpOnly; SameSite=Lax`
        );

        return resp;
      } else {
        // Handle login error
        return ctx.render({ error: data.error?.message || "Authentication failed" });
      }
    } catch (_error) {
      return ctx.render({ error: "An error occurred during authentication" });
    }
  },
};

export default function AuthCallback({ data }: PageProps) {
  if (data?.error) {
    return (
      <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-100">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <div class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span class="block sm:inline">{data.error}</span>
            </div>
            <div class="mt-4 text-center">
              <a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
                Return to login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-100">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication in progress...
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    </div>
  );
}

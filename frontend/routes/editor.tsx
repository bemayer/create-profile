import { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import ProfileEditor from "../islands/profile-editor.tsx";

const STRAPI_URL = "http://localhost:1337";

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const authToken = cookies.authToken;

    if (!authToken) {
      return new Response("", {
        status: 303,
        headers: { Location: "/login" },
      });
    }

    try {
      const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!userResponse.ok) {
        return new Response("", {
          status: 303,
          headers: { Location: "/login" },
        });
      }

      const userData = await userResponse.json();

      console.log("userData", userData);

      return ctx.render({ user: userData, token: authToken });
    } catch (error) {
      console.error("Error fetching user data:", error);
      return new Response("", {
        status: 303,
        headers: { Location: "/login" },
      });
    }
  },

  async POST(req, _ctx) {
    const cookies = getCookies(req.headers);
    const authToken = cookies.authToken;

    if (!authToken) {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const body = await req.json();
      const { id, bio } = body;

      console.log("BODY", body);

      const meResponse = await fetch(`${STRAPI_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          bio,
        }),
      });

      if (!meResponse.ok) {
        throw new Error(`Failed to update profile: ${meResponse.statusText}`);
      }

      const updatedUser = await meResponse.json();

      return new Response(JSON.stringify({ success: true, user: updatedUser }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return new Response(
        JSON.stringify({ success: false, error: (error as Error).message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};

export default function EditorPage({ data }: PageProps) {
  if (!data) {
    return (
      <div class="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const { user } = data;

  return (
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Profile Editor</h1>
          <div class="flex items-center">
            <span class="mr-4">Welcome, {user.username}</span>
            <a
              href="/logout"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Logout
            </a>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="border-4 border-gray-200 rounded-lg p-4 bg-white">
            <ProfileEditor
              user={user}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

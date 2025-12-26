export const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
export const REDIRECT_URI = window.location.origin + window.location.pathname;

export const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=token&scope=identify`;

export async function fetchDiscordUser(token) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Discord user");
  }
  return response.json();
}

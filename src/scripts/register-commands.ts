const DISCORD_APP_ID = process.env.DISCORD_APP_ID;
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_APP_ID) {
  throw new Error("DISCORD_APP_ID is not set. Please configure it in your environment.");
}

if (!DISCORD_BOT_TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN is not set. Please configure it in your environment.");
}

const DISCORD_API_BASE = "https://discord.com/api/v10";

type ApplicationCommandType = 1 | 2 | 3;

type ChatInputCommand = {
  name: string;
  description: string;
  type: ApplicationCommandType;
  default_member_permissions?: string;
  dm_permission?: boolean;
};

async function registerCommands(): Promise<void> {
  const url = `${DISCORD_API_BASE}/applications/${DISCORD_APP_ID}/commands`;

  const setupTrackerCommand: ChatInputCommand = {
    name: "setup_tracker",
    description: "Configure the MIR4 global boss tracker dashboard for this server.",
    type: 1,
    // Administrator permission only
    default_member_permissions: "8",
    dm_permission: false,
  };

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify([setupTrackerCommand]),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to register commands: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Successfully registered application commands:", data);
}

registerCommands().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

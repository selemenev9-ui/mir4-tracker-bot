import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

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

type ExistingCommand = {
  name: string;
  [key: string]: unknown;
};

const ALLOWED_COMMAND_FIELDS = new Set([
  "name",
  "type",
  "description",
  "options",
  "default_member_permissions",
  "dm_permission",
  "integration_types",
  "contexts",
  "nsfw",
  "name_localizations",
  "description_localizations",
]);

function sanitizeCommand(command: ExistingCommand): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const key of ALLOWED_COMMAND_FIELDS) {
    if (command[key] !== undefined) {
      sanitized[key] = command[key];
    }
  }
  return sanitized;
}

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

  const trackerCommand: ChatInputCommand = {
    name: "tracker",
    description: "Open the MIR4 boss tracker inside Discord.",
    type: 1,
    dm_permission: false,
  };

  const translateCommand = {
    name: "Translate",
    type: 3,
  } as const;

  const existingResponse = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
  });

  if (!existingResponse.ok) {
    const errorText = await existingResponse.text();
    throw new Error(`Failed to fetch existing commands: ${existingResponse.status} ${existingResponse.statusText} - ${errorText}`);
  }

  const existingCommands = (await existingResponse.json()) as ExistingCommand[];
  const namesToReplace = new Set(["setup_tracker", "tracker", "Translate"]);
  const preservedCommands = existingCommands
    .filter((command) => !namesToReplace.has(command.name))
    .map((command) => sanitizeCommand(command));

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
    body: JSON.stringify([...preservedCommands, setupTrackerCommand, trackerCommand, translateCommand]),
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

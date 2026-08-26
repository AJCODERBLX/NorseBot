# Roblox Airline Discord Bot

Features:
- Create flights (/createflight)
- Announce flights (/announceflight)
- Users apply (/apply)
- Staff review apps and DM users (/reviewapplication)
- SQLite persistence

Setup
1. Clone/copy the files into a directory.
2. Run `npm install`.
3. Create a Discord application and bot:
   - https://discord.com/developers/applications
   - Copy the BOT token into a `.env` file (see `.env.example`).
   - Copy the Application Client ID into `.env` as CLIENT_ID.
   - While testing, set GUILD_ID to your test server ID to register commands immediately.
   - In the Bot settings enable the privileged "Server Members Intent" if you want member-related features.
4. Invite the bot to your server with scopes `bot` and `applications.commands`. Example invite URL:
   https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=8
   - Permissions: at minimum the bot needs Send Messages and Embed Links. To register commands and perform admin actions, Manage Server or Administrator may be required for users.
5. Register slash commands:
   - `npm run deploy-commands`
   - If you used GUILD_ID in `.env`, commands are registered to that guild (faster). Otherwise global registration may take up to an hour.
6. Start the bot:
   - `npm start` (or `node index.js`)

Notes & customization
- Permission checks in commands require Manage Server permission. Change checks to a specific role ID if you prefer role-based staff control.
- The bot uses SQLite (data.sqlite) via better-sqlite3. You can switch to another DB if needed.
- You can add more fields to flights or applications as needed (e.g., seat map, autopopulate capacity).
- Consider hosting on a small VPS, Replit, or a cloud provider for 24/7 operation.

Commands (quick)
- /createflight flight_number origin destination depart_time capacity description
- /announceflight flight_number channel ping_role?
- /apply flight_number? experience?
- /reviewapplication user decision:accept|reject reason?

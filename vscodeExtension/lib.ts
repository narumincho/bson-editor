import { Command } from "../client/command.ts";

export const viewType = "narumincho.bsonEditor";

export const scriptFileName = "client.js";

export const commandToCommandId = (command: Command) => `bsonEditor.${command}`;

import { AppState } from "../appState.ts";

export type HandleCommand = (appState: AppState) => AppState;

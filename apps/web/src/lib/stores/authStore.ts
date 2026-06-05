import { writable } from "svelte/store";
import type { UserPublicDto } from "@tms/contracts";

export const currentUser = writable<UserPublicDto | null>(null);
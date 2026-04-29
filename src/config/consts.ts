/**
 * consts.ts
 * -----------------
 * A collection of constants used throughout the app, such as pagination settings and debounce timings.
 * This file serves as a single source of truth for these values, making it easier to maintain and update them in the future.
 * 
 * Note: These values are not meant to be configurable by users, but rather to provide sensible defaults for the application's behavior.
 * 
 * @module src/config/consts
 * @author James Latten
 * @created 2026-04-29
 * @version 1.0.0
 */

export const WORDS_PER_PAGE = 500

// Derived values — don't hardcode these anywhere else
export const CHARS_PER_PAGE = WORDS_PER_PAGE * 5.5  // avg chars/word
export const AUTOSAVE_DEBOUNCE_MS = 1500
export const SUGGESTION_DEBOUNCE_MS = 2000
export const SNAPSHOT_EVERY_N_SAVES = 10
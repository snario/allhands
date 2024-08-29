// Emoji.getEmojiFromJSON.test.js

import { getEmojiFromJSON } from "./emoji";

describe("Emoji.getEmojiFromJSON", () => {
    it("should handle input with Megaphone", () => {
        const input = "Megaphone";
        const expectedOutput = "📣"; // Assuming this is the default
        const result = getEmojiFromJSON(input);
        expect(result).toBe(expectedOutput);
    });

    it("should handle input with :eyes:", () => {
        const input = ":eyes:";
        const expectedOutput = "👀"; // Assuming this is the correct emoji for :sad:
        const result = getEmojiFromJSON(input);
        expect(result).toBe(expectedOutput);
    });

    it("should handle undefined input and return null", () => {
        const input = undefined;
        const expectedOutput = null;
        const result = getEmojiFromJSON(input);
        expect(result).toBe(expectedOutput);
    });

    it("should handle null input and return null", () => {
        const input = null;
        const expectedOutput = null;
        const result = getEmojiFromJSON(input);
        expect(result).toBe(expectedOutput);
    });
});

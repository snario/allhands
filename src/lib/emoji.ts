import EmojiMapJson from "./emojiMap.json";

const EmojiMap = JSON.parse(JSON.stringify(EmojiMapJson));

export function getEmojiFromJSON(shortcode?: string | null) {
    if (typeof shortcode === "undefined") return null;
    if (shortcode === null) return null;
    return findMatchingEmoji(shortcode);
}

export default {
    getEmojiFromJSON,
};

export type EmojiData = {
    short_name: string;
    name: string;
    short_names: string[];
    unified: string;
};

function findMatchingEmoji(searchTerm: string) {
    searchTerm = searchTerm.toLowerCase().replace(/:/g, ""); // Remove colons for exact match

    // First, check for an exact match with short_name
    const exactMatch = EmojiMap.find((emojiData: EmojiData) => {
        return emojiData.short_name.toLowerCase() === searchTerm;
    });

    if (exactMatch) {
        return unicodeToEmoji(exactMatch.unified); // Return the emoji character if exact match is found
    }

    // If no exact match, proceed with a broader search and return the first match found
    const broadMatch = EmojiMap.find((emojiData: EmojiData) => {
        return (
            emojiData.name.toLowerCase().includes(searchTerm) ||
            emojiData.short_name.toLowerCase().includes(searchTerm) ||
            emojiData.short_names.some((shortName) =>
                shortName.toLowerCase().includes(searchTerm),
            )
        );
    });

    return broadMatch ? unicodeToEmoji(broadMatch.unified) : null;
}

function unicodeToEmoji(unified: string) {
    return String.fromCodePoint(
        ...unified.split("-").map((u) => parseInt(`0x` + u)),
    );
}

// src/utils/textProcessing.js
import { removeStopwords } from 'stopword'

export const extractKeywords = (text) => {
    if (!text) return new Set();
    return new Set(
        removeStopwords(
            text
                .toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/)
                .filter(word => word.length > 2)
            )
    );
};

export const calculateKeywordSimilarity = (text1, text2) => {
    // based on the number of common keywords
    // TODO: implement a more sophisticated similarity measure

    const keywords1 = extractKeywords(text1);
    const keywords2 = extractKeywords(text2);
    // console.log("Keywords 1:", keywords1);
    // console.log("Keywords 2:", keywords2);
    let commonKeywordsCount = 0;
    for (const keyword of keywords1) {
        if (keywords2.has(keyword)) {
            commonKeywordsCount++;
        }
    }
    return commonKeywordsCount;
};
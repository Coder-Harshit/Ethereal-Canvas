
const URL_REGEX = /https?:\/\/[^\s/$.?#].[^\s]*/gi;

export const parseNodeContent = (content) => {
    const urls = content.match(URL_REGEX) || [];
    const text = content.replace(URL_REGEX, '').trim();
    return { text, urls };
};

export const parseAndTransform = (content) => {
    const urls = content.match(URL_REGEX) || [];
    const text = content.replace(URL_REGEX, (url) => `[link](${url})`);
    return { text, urls };
}

export const syncUrls = (content) => {
    const urls = content.match(URL_REGEX) || [];
    return urls;
}

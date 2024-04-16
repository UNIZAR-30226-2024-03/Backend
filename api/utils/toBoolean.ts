
export function toBoolean(query: any, key: string): boolean | null {
    const value = query[key];

    if (typeof value === 'string' && value.toLowerCase() === 'true') {
        return true;
    } else if (typeof value === 'string' && value.toLowerCase() === 'false') {
        return false;
    } else if (value === undefined) {
        return null;
    } else {
        throw new Error('Bad request. Invalid parameter ' + key + ' value.');
    }
}
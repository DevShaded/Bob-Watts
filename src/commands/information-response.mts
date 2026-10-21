export function record(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function imageUrl(value: unknown): value is string {
    if (typeof value !== 'string' || !value || value.length > 512) return false;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}

export function httpStatus(error: unknown): string | undefined {
    if (!record(error) || !record(error.response)) return undefined;
    const { status, statusText } = error.response;
    if (typeof status !== 'number' || !Number.isInteger(status) || typeof statusText !== 'string') return undefined;
    return `Error code: \`${status.toString()} ${statusText.slice(0, 100)}\` `;
}

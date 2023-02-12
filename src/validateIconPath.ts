export default function validateIconPath(path: string) {
    if (typeof path !== 'string') {
        return false;
    }
    return path.match(/^(?:M\d+ \d+(?:M\d+ \d+|[HV]\d+)+Z)$/) !== null;
}
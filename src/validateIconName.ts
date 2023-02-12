export default function validateIconName(name: string) {
    if (typeof name !== 'string') {
        return false;
    }
    return name.match(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/) !== null;
}
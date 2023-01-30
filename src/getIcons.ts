const cache = new Map();

export function getIcons() {
    const key = 'icons';
    if (cache.has(key)) {
        return Promise.resolve(cache.get(key));
    }
    const packageId = '2764ae46-20c1-11ed-8ca4-1209440c2141';
    return new Promise<any[]>((resolve) => {
        fetch(`https://dev.materialdesignicons.com/api/package/${packageId}`)
            .then((response) => {
                response.json().then((data) => {
                    cache.set(key, data.icons);
                    resolve(data.icons);
                });
            });
    });
}
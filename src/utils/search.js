export default function approximateSearch(entries, key) {
    let copy = [...entries].sort();

    // case insensitive
    function matched_characters(a, b) {
        if (a !== undefined && b !== undefined) {
            let count = 0;
            let shorter_length = Math.min(a.length, b.length);

            for (let i = 0; i < shorter_length; ++i) {
                if (a[i].toUpperCase() === b[i].toUpperCase()) {
                    count++;
                } else {
                    return count;
                }
            }

            return count;
        }
        return 0;
    }

    // This will result in the `key` item percolating itself upwards, which is what we want
    // related entries will show up nearby. Anything that is not directly alphabetically related is going to
    // be trouble.
    copy = copy.sort(
        (x, y) => {
            // TODO(jerry or anyone else):  remove this dependency.
            let matched = [matched_characters(x.name, key), matched_characters(y.name, key)];
            if (matched[0] !== 0 || matched[1] !== 0) {
                // Closer matches get pushed forwards.
                if (matched[0] > matched[1]) {
                    return -1;
                } else if (matched[0] < matched[1]) {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                // none of them match the characters...
                // Push them to the back, they are irrelevant.
                if (y !== undefined) {
                    if (y < key) {
                        return 1;
                    } else if (y > key) {
                        return 1;
                    } else {
                        // This is the key itself.
                        return -1;
                    }
                }

                if (x < key) {
                    return 1;
                } else if (x > key) {
                    return 1;
                } else {
                    // This is the key itself.
                    return -1;
                }
            }
        }
    );

    return copy;
}

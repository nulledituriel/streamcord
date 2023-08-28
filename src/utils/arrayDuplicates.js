module.exports = (arrayToFilter) => {
    let areDuplicates = false;
    let duplicatesIndexes = [];

    // check for duplicates

    let valuesSoFar = Object.create(null);
    for (let i = 0; i < arrayToFilter.length; ++i) {
        let value = arrayToFilter[i];
        if (value in valuesSoFar) {
            areDuplicates = true;
        }
        valuesSoFar[value] = true;
    }

    // get the index of the duplicate(s)

    let valuesSoFar2 = Object.create(null);
    if (areDuplicates) {
        for (let i = 0; i < arrayToFilter.length; ++i) {
            let tempindexes = [];
            let value = arrayToFilter[i];
            if (value in valuesSoFar2) {
                tempindexes.push(i);
            }
            duplicatesIndexes.push([value, tempindexes]);
            valuesSoFar2[value] = true;
        }
    }

    let indexesToRemove = [];
    for (let i = 0; i < duplicatesIndexes.length; i++) {
        if(duplicatesIndexes[i][1].length > 0) {
            indexesToRemove.push(i);
        }
    }

    return [areDuplicates, indexesToRemove];

}
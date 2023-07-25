/**
 * Convenience function for delaying execution.
 * @param {number} ms Sleep duration in milliseconds.
 */
export function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Generates a random string of letters.
 * @param {number} length Length of the random string.
 * @returns String of <length> lowercase/uppercase letters.
 */
export function randomLetters(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const charactersLength = characters.length;

    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}

/**
 * Generates current time stamp in slightly adjusted ISO format.
 * @returns Example: 2023-07-25 11:53:54.785
 */
export function currentDate() {
    let d = new Date();
    let dStr = d.toISOString();
    dStr.replace("T", " ");
    dStr.replace("Z", "");

    return dStr;
}

/**
 * Generates a random integer within specified minimum and maximum.
 * @param {number} min Minimum integer. Inclusive.
 * @param {number} max Maximum integer. Exclusive.
 * @returns Random integer within range [min, max).
 */
export function randomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

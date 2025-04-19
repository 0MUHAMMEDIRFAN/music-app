// Format duration from milliseconds to mm:ss
export const formatDuration = (durationInMilliseconds: number, inMillis: boolean = true) => {
    if (!durationInMilliseconds) return "0:00";
    const durationInSeconds = inMillis ? durationInMilliseconds / 1000 : durationInMilliseconds;
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};
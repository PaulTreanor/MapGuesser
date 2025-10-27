const generateGameCode = () => {
    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return gameCode;
}

export {
    generateGameCode
}
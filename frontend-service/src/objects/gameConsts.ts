const numberOfRoundsInGame = 5;
const indexOfFinalRound = numberOfRoundsInGame - 1;

// Distance buffer (in km) for guesses - see GitHub issue #9
const cityBufferKm = 2;

/**
 * Maximum (worst) score in kilometers
 * Settled on 20k as it's the distiance to antipode on Eath (ie. worst possible score)
 */
const MAX_SCORE = 20000; 

export { 
    numberOfRoundsInGame, 
    indexOfFinalRound, 
    cityBufferKm, 
    MAX_SCORE 
};
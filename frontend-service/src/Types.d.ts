export type Pin = [number, number]

export type Round = {
  location: string;
  coordinates: Pin;
}

type GameRound = {
  round: Round
  playerGuessPosition: Pin | null
  playerGuessDistance: number | null
}
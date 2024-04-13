import { Pin } from '../Types';

export function calculateKm(pin1: Pin, pin2: Pin): number {
  const toRad = (value: number): number => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(pin2[0] - pin1[0]);
  const dLon = toRad(pin2[1] - pin1[1]);

  const lat1 = toRad(pin1[0]);
  const lat2 = toRad(pin2[0]);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return parseFloat((earthRadiusKm * c).toFixed(0));
}

export function emojiForDistances(distance: number): string {
  if (distance < 5) {
    return "🎯"
  }
  if (distance <= 100) {
    return "👌"
  }
  if (distance <= 250) {
    return "🫤"
  }
  return "😳"
}
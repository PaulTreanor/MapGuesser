import { Pin } from '../Types';
import { distance } from '@turf/distance';

export function calculateKm(pin1: Pin, pin2: Pin): number {
	const distanceInKm = distance(pin1, pin2, {units: 'kilometers'});
	return Math.round(distanceInKm);
}

export function emojiForDistances(distance: number): string {
	if (distance < 10) {
		return "🎯"
	}
	if (distance <= 200) {
		return "👌"
	}
	if (distance <= 500) {
		return "🫤"
	}
	return "😳"
}
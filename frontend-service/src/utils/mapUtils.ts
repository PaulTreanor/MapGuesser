import { Pin } from '../components/types/Game.types';
import { distance } from '@turf/distance';
import { cityBufferKm } from '../objects/gameConsts';

export function calculateKm(pin1: Pin, pin2: Pin): number {
	const distanceInKm = distance(pin1, pin2, {units: 'kilometers'});
	const adjustedDistance = Math.max(0, distanceInKm - cityBufferKm);
	return Math.round(adjustedDistance);
}

export function emojiForDistances(distance: number): string {
	if (distance === 0) {
		return "✨"
	}
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
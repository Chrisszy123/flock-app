import { Coordinates, GeofenceResult } from '../types';

/**
 * Earth's radius in meters
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * This is the standard formula for calculating great-circle distances between two points
 * on a sphere given their longitudes and latitudes.
 * 
 * @param point1 - First coordinate (latitude, longitude)
 * @param point2 - Second coordinate (latitude, longitude)
 * @returns Distance in meters
 */
export function calculateHaversineDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLng = toRadians(point2.longitude - point1.longitude);

  // Haversine formula
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in meters
  return EARTH_RADIUS_METERS * c;
}

/**
 * Checks if a user's coordinates are within the allowed radius of a target location.
 * This is the core geofencing function used for attendance check-in validation.
 * 
 * @param userLocation - User's current coordinates
 * @param targetLocation - Target location (church/event coordinates)
 * @param allowedRadiusMeters - Maximum allowed distance in meters
 * @returns GeofenceResult with validation status and distance info
 */
export function checkGeofence(
  userLocation: Coordinates,
  targetLocation: Coordinates,
  allowedRadiusMeters: number
): GeofenceResult {
  const distance = calculateHaversineDistance(userLocation, targetLocation);

  return {
    isWithinRadius: distance <= allowedRadiusMeters,
    distance: Math.round(distance), // Round to whole meters for readability
    allowedRadius: allowedRadiusMeters,
  };
}

/**
 * Validates that coordinates are within valid ranges
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}

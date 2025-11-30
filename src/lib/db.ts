// Import PrismaClient directly - Next.js/Turbopack will handle TypeScript
import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('[db] ERROR: DATABASE_URL environment variable is not set!');
  console.error('[db] Please create a .env file with: DATABASE_URL="postgresql://user:password@host:port/database"');
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('[db] Connection test failed:', error);
    return false;
  }
}

// Raw SQL query helper for PostGIS operations
// Use Prisma.$queryRawUnsafe with positional parameters ($1, $2, etc.)
export async function queryDb<T>(query: string, ...params: unknown[]): Promise<T[]> {
  try {
    // Prisma $queryRawUnsafe expects parameters as separate arguments
    const result = await prisma.$queryRawUnsafe<T[]>(query, ...params);
    return result;
  } catch (error) {
    console.error('[db] Query error:', error);
    throw error;
  }
}

// Helper to get coordinates from a location_id
export async function getLocationCoordinates(locationId: number): Promise<{ longitude: number; latitude: number } | null> {
  try {
    const query = `
      SELECT 
        ST_X(geom::geometry) as longitude,
        ST_Y(geom::geometry) as latitude
      FROM user_locations
      WHERE location_id = $1
    `;
    const result = await queryDb<{ longitude: number; latitude: number }>(
      query,
      locationId
    );
    return result[0] || null;
  } catch (error) {
    console.error('[db] Error getting coordinates:', error);
    return null;
  }
}

// Helper to calculate distance between two points using PostGIS
export async function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  const query = `
    SELECT ST_Distance(
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography
    ) / 1000.0 as distance_km
  `;
  const result = await queryDb<{ distance_km: number }>(query, lon1, lat1, lon2, lat2);
  return result[0]?.distance_km ?? 0;
}

// Helper to find locations within radius
export async function findLocationsWithinRadius(
  centerLat: number,
  centerLon: number,
  radiusKm: number
) {
  const query = `
    SELECT 
      location_id,
      user_id,
      address,
      ST_X(geom::geometry) as longitude,
      ST_Y(geom::geometry) as latitude,
      ST_Distance(
        geom,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) / 1000.0 as distance_km
    FROM user_locations
    WHERE ST_DWithin(
      geom,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
      $3 * 1000
    )
    ORDER BY distance_km
  `;
  return queryDb(query, centerLon, centerLat, radiusKm);
}

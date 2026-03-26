import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'platform-dev-secret-change-in-production',
);

const ISSUER = 'platform';
const AUDIENCE = 'platform-mfe';

export async function createToken(
  payload: Record<string, unknown>,
  expiresIn = '1h',
): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<jose.JWTPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload;
  } catch {
    return null;
  }
}

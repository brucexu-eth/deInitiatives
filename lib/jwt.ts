import { SignJWT, jwtVerify } from 'jose';
import { getEnvVar } from './env';

const JWT_SECRET = getEnvVar('JWT_SECRET');

export interface JWTPayload {
  address: string;
  nonce: string;
  iat: number;
  exp: number;
}

export async function createToken(
  address: string,
  nonce: string
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 7 * 24 * 60 * 60; // 7 days

  const token = await new SignJWT({ address, nonce })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(new TextEncoder().encode(JWT_SECRET));

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    return payload as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}

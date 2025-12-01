import { randomUUID } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

export interface Session {
  id: string;
  createdAt: number;
  expiresAt: number;
}

const SESSION_DURATION = 60 * 60 * 1000;

const getSecretKey = () => {
  const secret = process.env.SECRET_KEY || "default-secret-key-change-in-production";
  return new TextEncoder().encode(secret);
};

export async function createSession(): Promise<{ session: Session; token: string }> {
  const id = randomUUID();
  const createdAt = Date.now();
  const expiresAt = createdAt + SESSION_DURATION;

  const session: Session = {
    id,
    createdAt,
    expiresAt,
  };

  const token = await new SignJWT({
    sessionId: id,
    createdAt,
    expiresAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(getSecretKey());

  return { session, token };
}

export async function validateSession(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (typeof payload.expiresAt === "number" && payload.expiresAt < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function getSession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    const expiresAt = payload.expiresAt as number;
    const createdAt = payload.createdAt as number;
    const sessionId = payload.sessionId as string;

    if (expiresAt < Date.now()) {
      return null;
    }

    return {
      id: sessionId,
      createdAt,
      expiresAt,
    };
  } catch {
    return null;
  }
}

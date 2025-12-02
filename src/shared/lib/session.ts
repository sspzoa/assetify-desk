import { jwtVerify, SignJWT } from "jose";

export interface Session {
  expiresAt: number;
}

const SESSION_DURATION = 60 * 60 * 1000;

const getSecretKey = () => {
  const secret = process.env.SECRET_KEY;

  if (!secret) {
    throw new Error("SECRET_KEY environment variable is not set");
  }

  return new TextEncoder().encode(secret);
};

export async function createSession(): Promise<{ session: Session; token: string }> {
  const expiresAt = Date.now() + SESSION_DURATION;

  const session: Session = {
    expiresAt,
  };

  const token = await new SignJWT({
    expiresAt,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(getSecretKey());

  return { session, token };
}

export async function validateSession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function getSession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    return {
      expiresAt: payload.expiresAt as number,
    };
  } catch {
    return null;
  }
}

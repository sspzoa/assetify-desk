import crypto from "crypto";

export async function validateBearerToken(token: string): Promise<boolean> {
  const secretKey = process.env.SECRET_KEY;

  if (!secretKey || !token) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secretKey));
}

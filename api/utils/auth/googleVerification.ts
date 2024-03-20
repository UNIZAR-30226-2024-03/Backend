import { config } from "dotenv";
import { OAuth2Client } from "google-auth-library";

export const verify = async (token: string) => {
  config();
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
};

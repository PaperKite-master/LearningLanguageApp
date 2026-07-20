import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

function getSigningKey(header) {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      resolve(key.getPublicKey());
    });
  });
}

export async function optionalAuthenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await new Promise((resolve, reject) => {
      const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
      getSigningKey(header)
        .then((signingKey) => {
          jwt.verify(token, signingKey, { algorithms: ['ES256', 'RS256', 'HS256'] }, (err, payload) => {
            if (err) reject(err);
            else resolve(payload);
          });
        })
        .catch(reject);
    });

    req.user = decoded;
  } catch {
    req.user = null;
  }
}

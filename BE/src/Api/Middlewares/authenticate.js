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

/**
 * Fastify preHandler - verify Supabase JWT (ES256 via JWKS).
 * Attaches decoded payload to req.user.
 */
export async function authenticate(req, reply) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized: missing token' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await new Promise((resolve, reject) => {
      // Decode header to get kid
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
  } catch (err) {
    req.log.warn({ err }, 'JWT verification failed');
    return reply.status(401).send({ statusCode: 401, error: 'Unauthorized: invalid token' });
  }
}

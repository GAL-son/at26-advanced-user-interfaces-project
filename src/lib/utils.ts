import crypto from 'crypto';

export function generateEventId(server: string, jsonUrl: string) {
  return crypto.createHash('md5').update(`${server}${jsonUrl}`).digest('hex');
}
import * as Random from 'expo-random';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
const N = CHARSET.length;                  // 66
const MAX_VALID_BYTE = Math.floor(256 / N) * N - 1; // 197 (avoid modulo bias)

export class CryptoService {
  static async generateRandomString(length = 43): Promise<string> {
    let out = '';
    while (out.length < length) {
      const bytes = await Random.getRandomBytesAsync(length - out.length);
      for (let i = 0; i < bytes.length && out.length < length; i++) {
        const b = bytes[i];
        if (b > MAX_VALID_BYTE) continue;  // reject to keep uniform distribution
        out += CHARSET[b % N];
      }
    }
    return out;
  }
}
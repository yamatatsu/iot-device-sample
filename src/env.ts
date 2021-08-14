export const ENDPOINT = getEnv("ENDPOINT");
export const CA_FILE = getEnv("CA_FILE");
export const CERT = getEnv("CERT");
export const KEY = getEnv("KEY");

function getEnv(envName: string): string {
  const env = process.env[envName];
  if (!env) {
    throw new Error(`Environment Variable: ${envName} is needed.`);
  }
  return env;
}

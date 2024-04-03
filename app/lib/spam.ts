import spam from '../lib/spam.json';

export function checkSpam(input: string): boolean {
  const lower = input.toLowerCase();
  for (const spamWord of spam) {
    if (lower.includes(spamWord)) {
      return true;
    }
  }
  return false;
}

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const password = {
  hash: (plainText: string) => bcrypt.hash(plainText, SALT_ROUNDS),
  compare: (plainText: string, hashedPassword: string) => bcrypt.compare(plainText, hashedPassword),
};

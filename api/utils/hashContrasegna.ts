import bcrypt from "bcrypt";

const saltRounds = 10;

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, saltRounds);
}

export function compareWithHash(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

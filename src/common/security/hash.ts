import * as bycrypt from 'bcrypt';

export function hashPassword(pass: string, salt: number = 8) {
  return bycrypt.hashSync(pass, salt);
}

export function comparePassword(pass: string, hashPassword: string) {
  return bycrypt.compareSync(pass, hashPassword);
}

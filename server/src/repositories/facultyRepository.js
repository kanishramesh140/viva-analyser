import {
  createAccount,
  findAccount,
  publicAccount,
} from "../services/accounts.js";

export async function findFaculty(username) {
  const account = await findAccount(username);
  return account ? publicAccount(account) : null;
}

export async function createFaculty(payload) {
  const account = await createAccount(payload);
  return publicAccount(account);
}

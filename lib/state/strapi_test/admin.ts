import axios from 'axios';
// TODO(jerry):
// merge all into more coherent structure when this is all
// working

// Oh my is most of this unwieldy...
// Duplicated for testing reasons
const STRAPI_INSTANCE_URL = "http://localhost:1337";

export enum LoginType {
  NotLoggedIn,
  Anonymous,
  User,
  Admin,
}

export interface AccountDetails {
  email: string;
  password: string;
}

export interface LoginAttemptResult {
  type: LoginType,
  accountDetails?: AccountDetails,
}

export async function loginWith(information?: AccountDetails) {
	if (!information) {
		return;
	}

	try {
		const response = await axios.post(
			`${STRAPI_INSTANCE_URL}/auth/local`,
			{
				identifier: information.email,
				password: information.password,
			}
		);

		console.log('auth logged in?');
		console.log(response.data.user);

		return { type: LoginType.User, user: undefined};
	} catch (error) {
		console.log(error);
	} finally {
		return { type: LoginType.Anonymous, user: undefined };
	}
}

// sorry for tabs, not sure why VSCode is doing this right now.
export async function registerAccount(accountDetails: AccountDetails) {
	try {
		const response = await axios.post(
			`${STRAPI_INSTANCE_URL}/auth/local/register`,
			{
				username: accountDetails.email,
				email: accountDetails.email,
				password: accountDetails.password,
			}
		);

		console.log(response.data.user);
	} catch (error) {
		console.log(error);
	}
}

export async function loginWithEmailAndPassword(accountDetails?: AccountDetails) {
    const result = await loginWith(accountDetails);
    const type = result?.type;

    if (type !== LoginType.Anonymous) {
      return {
        accountDetails,
        type: type,
        customData: {},
      };
    }

    return { type };
}
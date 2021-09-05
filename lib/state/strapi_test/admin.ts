import axios from 'axios';
// TODO(jerry):
// merge all into more coherent structure when this is all
// working

// Oh my is most of this unwieldy...
// Duplicated for testing reasons
const STRAPI_INSTANCE_URL = "http://localhost:1337";

export interface AccountDetails {
  email: string;
  password: string;
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
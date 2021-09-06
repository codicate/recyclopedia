import { createSlice, createDraftSafeSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { AppState } from "state/store";

import * as Requests from 'lib/requests';
// TODO(jerry):
// merge all into more coherent structure when this is all
// working

// Oh my is most of this unwieldy...
// Duplicated for testing reasons
const STRAPI_INSTANCE_URL = "http://localhost:1337";

export enum LoginType {
	NotLoggedIn,
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
	userInformation?: User,
}

export interface User {
	username:   string,
	email:      string,
	created_at: Date,
	accessToken: string,
}

interface ApplicationState {
	loginType: LoginType,
	userInformation?: User,
	accountDetails?: AccountDetails,
}

export async function loginWith(information?: AccountDetails) : Promise<LoginAttemptResult> {
	const failure = { type: LoginType.NotLoggedIn, };

	if (!information) {
		console.log("shit!");
		return failure;
	}

	try {
		const response = await Requests.post(
			`${STRAPI_INSTANCE_URL}/auth/local`,
			{
				identifier: information.email,
				password: information.password,
			}
		);

		const { user, jwt } = response.data;
		const { username, email, created_at } = user;

		console.log("response survived!");

		let type: LoginType = LoginType.User;
		if (user.role.name === "Author") {
			type = LoginType.Admin;
		}

		return { 
			type,
			accountDetails: information,
			userInformation: {
				username,
				email,
				created_at,
				accessToken: jwt
			}
		};
	} catch (error) {
		console.log("error!");
		console.log(error);
	}

	return failure;
}

// sorry for tabs, not sure why VSCode is doing this right now.
export async function registerAccount(accountDetails: AccountDetails) {
	try {
		const response = await Requests.post(
			`${STRAPI_INSTANCE_URL}/auth/local/register`,
			{
				username: accountDetails.email,
				email: accountDetails.email,
				password: accountDetails.password,
			}
		);
	} catch (error) {
		console.log(error);
	}
}

export const loginWithEmailAndPassword = createAsyncThunk(
	"admin/loginWithEmailAndPassword",
	async function (accountDetails?: AccountDetails) : Promise<LoginAttemptResult> {
		console.log("admin/loginWithEmailAndPassword");
		const loginResult = await loginWith(accountDetails);
		return loginResult;
	}
)

const adminInitialState: ApplicationState = {
	loginType: LoginType.NotLoggedIn,
};

const adminSlice = createSlice(
	{
		name: "admin",
		initialState: adminInitialState,	

		reducers: {
			logout: function (state) {
				state.loginType = LoginType.NotLoggedIn;
			},
		},

		extraReducers: function (builder) {
			builder.addCase(
				loginWithEmailAndPassword.fulfilled,
				function (state, action) {
					console.log("work");
					const { accountDetails, userInformation, type, } = action.payload;
					state.loginType = type;
					state.userInformation = userInformation;
					state.accountDetails  = accountDetails;
				}
			)
		}
	}
);

export const { logout } = adminSlice.actions;
export default adminSlice.reducer;

// @ts-ignore
const selector = (name: string) => createDraftSafeSelector((state: AppState) => state.admin, (admin) => admin[name]);
export const selectAccountDetails    = selector("accountDetails");
export const selectLoginType         = selector("loginType");
export const selectUserInformation   = selector("userInformation");
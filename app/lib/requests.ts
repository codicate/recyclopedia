/*
  I want to share this across React Native as well!

  So this is a polymorphic request system so we only write the request
  code... Basically once...
*/

// It's kind of annoying to just swap this around but whatever.
// This "wrapper" at least frees us from using Axios in the future.
// Since we only need to promise that we maintain the same interface.

// NOTE(jerry): Expand as needed...
// The only custom thing we really seem to need are just headers.
export interface RequestConfiguration {
	headers?: any,
}
export interface Response<responseDataType = any> {
	data?: responseDataType; // This is required for the stub implementation. As the stub shouldn't return... Anything...
	status: number;
	headers: any;
}
export interface NotUndefinedResponse<responseDataType = any> {
	data: responseDataType;
	status: number;
	headers: any;
}
export interface RequestImplementation {
	get:     <responseType>(url: string, config?: RequestConfiguration) => Promise<Response<responseType>>;
	delete:  <responseType>(url: string, config?: RequestConfiguration) => Promise<Response<responseType>>;
	post:    <responseType, dataType>(url: string, data: dataType, config?: RequestConfiguration) => Promise<Response<responseType>>;
	put:     <responseType, dataType>(url: string, data: dataType, config?: RequestConfiguration) => Promise<Response<responseType>>;
};

// Honestly... These should probably always "exception".
const stubImplementation: RequestImplementation = {
	async get<responseType>(url: string, config?: RequestConfiguration): Promise<Response<responseType>> {
		return { status: 400, headers: {} };
	},
	async delete<responseType>(url: string, config?: RequestConfiguration): Promise<Response<responseType>> {
		return { status: 400, headers: {} };
	},
	async post<responseType, dataType>(url: string, data: dataType, config?: RequestConfiguration): Promise<Response<responseType>> {
		return { status: 400, headers: {} };
	},
	async put<responseType, dataType>(url: string, data: dataType, config?: RequestConfiguration): Promise<Response<responseType>> {
		return { status: 400, headers: {} };
	}
};

let implementation: RequestImplementation = stubImplementation;
let implementationProvided = false;

export function provideImplementation(newImplementation: RequestImplementation) {
	if (!implementationProvided) {
		implementationProvided = true;
		implementation = newImplementation;
	} else {
		throw new Error("Hmmm? I don't think reinitializing this was ever intended.");
	}
}

function errorResponseForDefaultData<responseType = any>(data: responseType): NotUndefinedResponse<responseType> {
  return {
    status: 400,
    data,
    headers: {},
  };
}

export async function get<responseType = any>(url: string, config?: RequestConfiguration) : Promise<Response<responseType>>{
	return implementation.get<responseType>(url, config);
}

// gah! Reserved keywords finally bite!
// TODO(jerry): rename later.
export async function _delete<responseType = any>(url: string, config?: RequestConfiguration) : Promise<Response<responseType>>{
	return implementation.delete<responseType>(url, config);
}

export async function put<responseType = any, dataType = any>(url: string, data: dataType, config?: RequestConfiguration) : Promise<Response<responseType>>{
	return implementation.put<responseType, dataType>(url, data, config);
}

export async function post<responseType = any, dataType = any>(url: string, data: dataType, config?: RequestConfiguration) : Promise<Response<responseType>>{
	return implementation.post<responseType, dataType>(url, data, config);
}

// Safe / Defaulting versions of the functions.
// Use if you will provide default data and don't want to handle exceptions. I mean this isn't so great but whatever.

// These are "NotUndefinedResponses", and since
// Responses are just a superset for NotUndefinedResponses, this should be completely fine
// as the only time responses should be "undefined" is when they error out.
// (or in the stub, which is a bit different! I should make it only throw exceptions!)
export async function get_safe<responseType = any>(url: string, defaultValue: responseType, config?: RequestConfiguration): Promise<NotUndefinedResponse<responseType>> {
	try {
		const promise = (get(url, config)) as Promise<NotUndefinedResponse>;
		return promise;
	} catch (error) {
		console.error(error);
		return errorResponseForDefaultData(defaultValue);
	}
}
export async function delete_safe<responseType = any>(url: string, defaultValue: responseType, config?: RequestConfiguration): Promise<NotUndefinedResponse<responseType>> {
	try {
		const promise = (_delete(url, config)) as Promise<NotUndefinedResponse>;
		return promise;
	} catch (error) {
		console.error(error);
		return errorResponseForDefaultData(defaultValue);
	}
}
export async function put_safe<dataType = any, responseType = any>(url: string, defaultValue: responseType, data?: dataType, config?: RequestConfiguration): Promise<NotUndefinedResponse<responseType>> {
	try {
		const promise = (put(url, data, config)) as Promise<NotUndefinedResponse>;
		return promise;
	} catch (error) {
		console.error(error);
		return errorResponseForDefaultData(defaultValue);
	}
}
export async function post_safe<dataType = any, responseType = any>(url: string, defaultValue: any, data?: any, config?: RequestConfiguration): Promise<NotUndefinedResponse<responseType>> {
	try {
		const promise = (post(url, data, config)) as Promise<NotUndefinedResponse>;
		return promise;
	} catch (error) {
		console.error(error);
		return errorResponseForDefaultData(defaultValue);
	}
}

// NOTE(jerry): we never use mutations.
export async function graphql_query<responseType>(endpoint: string, graphQLQuery: string, config?: RequestConfiguration): Promise<NotUndefinedResponse<responseType>> {
	const promise = (post(endpoint, {query: graphQLQuery}, config));
	return promise as Promise<NotUndefinedResponse>;
}
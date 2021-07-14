import { Credentials, App } from 'realm-web';

import { Secrets } from 'secrets';


const APP_ID = Secrets.RECYCLOPEDIA_APPLICATION_ID;
export const REALM_GRAPHQL_ENDPOINT = `https://realm.mongodb.com/api/client/v2.0/app/${APP_ID}/graphql`;

const app = new App({
  id: APP_ID,
  baseUrl: 'https://realm.mongodb.com',
});

// Copied from https://github.com/vercel/next.js/blob/f9001b97bb4fd75b6654009d93fae06f242a12bf/examples/with-realm-web/lib/RealmClient.js#L11
export const generateAuthHeader = async () => {
  (!app.currentUser)
    ? await app.logIn(Credentials.anonymous())
    : await app.currentUser.refreshCustomData();

  if (!app.currentUser) return;
  const { accessToken } = app.currentUser;

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};
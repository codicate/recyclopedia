import * as Realm from "realm-web";

export class RecyclopediaApplicationContext {
  constructor(appId, onFinishedLoadFn) {
    const recyclopediaAnonymousCredentials = Realm.Credentials.anonymous();

    this.application = new Realm.App({ id: appId });
    this.applicationUser = undefined;

    (async function () {
      try {
        const result = await this.application.logIn(recyclopediaAnonymousCredentials);
        this.applicationUser = result;
      } catch (error) {
        console.error("Failed to login because: ", error);
      }

      onFinishedLoadFn.bind(this)();
    }).bind(this)();
  }

  queryForArticles(query) {
    // I should "lazy-init" login this
    // however I forced a buffer load, before anything happens
    // so I am guaranteed to have a user unless we couldn't login for some reason.
    if (this.applicationUser) {
      return (async function () {
        if (query) {
          return await this.applicationUser.functions.getAllArticles(query);
        } else {
          return await this.applicationUser.functions.getAllArticles();
        }
      }).bind(this)();
    } else {
      console.error("No user? This is bad news.");
    }

    return undefined;
  }

  deleteArticle(name) {
    if (this.applicationUser) {
      (async function () {
        this.applicationUser.functions.removeArticle(name);
      }).bind(this)();
    } else {
      console.error("No user? This is bad news.");
    }
  }

  insertArticle(articleContents) {
    if (this.applicationUser) {
      (async function () {
        await this.applicationUser.functions.createOrUpdateArticle(articleContents);
      }).bind(this)();
    } else {
      console.error("No user? This is bad news.");
    }

    return undefined;
  }
}
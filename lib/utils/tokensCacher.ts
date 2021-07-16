import path from "path";
import fse from "fs-extra";


// https://github.com/vercel/next.js/discussions/11272#discussioncomment-853781
export default class TokensCasher<T extends { id: string; }> {
  private tokensFilePath: string;

  constructor(tokenName: string) {
    this.tokensFilePath = path.join(process.cwd(), `cache/tokens/${tokenName}.json`);
  }

  cacheTokens(tokens: T[]) {
    const tokenObj = tokens.reduce((tokenObj, token) => ({
      ...tokenObj,
      [token.id]: token
    }), {});

    console.log(this.tokensFilePath);

    return fse.outputJSONSync(this.tokensFilePath, JSON.stringify(tokenObj));
  };

  retrieveToken(id: string) {
    console.log(this.tokensFilePath);

    const tokensFile = fse.readJsonSync(this.tokensFilePath);
    const tokenObj = JSON.parse(tokensFile.toString()) as Record<string, T>;
    return tokenObj[id];
  };
}
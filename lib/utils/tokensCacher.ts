import path from "path";
import fs from "fs/promises";


// https://github.com/vercel/next.js/discussions/11272#discussioncomment-853781
export default class TokensCasher<T extends { id: string; }> {
  private tokensFilePath: string;

  constructor(tokenName: string) {
    this.tokensFilePath = path.join(process.cwd(), `${tokenName}.json`);
  }

  cacheTokens(tokens: T[]) {
    const tokenObj = tokens.reduce((tokenObj, token) => ({
      ...tokenObj,
      [token.id]: token
    }), {});

    return fs.writeFile(this.tokensFilePath, JSON.stringify(tokenObj));
  };

  async retrieveToken(id: string) {
    const tokensFile = await fs.readFile(this.tokensFilePath);
    const tokenObj = JSON.parse(tokensFile.toString()) as Record<string, T>;
    return tokenObj[id];
  };
}
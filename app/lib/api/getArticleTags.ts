import realm from 'utils/realmClient';


const getArticleTags = async (): Promise<string[]> => {
  if (!realm.currentUser) return [];
  return await realm.currentUser.functions.getAllTags();
};

export default getArticleTags;
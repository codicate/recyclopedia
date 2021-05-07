import styles from 'pages/Admin/TagEditor';

export default {};

const articles = [
  { // 0
    name: "ASDF",
    content: "I like trains",
    tags: ['tree', 'asdf', 'train']
  },
  { // 1
    name: "brain",
    content: "brain",
    tags: ['brain']
  },
  { // 2
    name: "yrain",
    content: "yrain",
    tags: ['brain', 'yrain']
  },
  { // 3
    name: "fadsiuofdiosuafhuidjsaifhdusahifudsihufdsahiusadfhuifdsahiufdasuihfhiudfsiuhihufauishfidhusafiuhasdfihuasdfhiusf",
    content: "yrain",
    tags: ['asdf']
  }
];


function findTag(articles, tags) {
  const result = articles.filter(function (article) {

    if (article.tags.indexOf('tree') !== -1) {
      return true;
    }
  });
  console.table(
    result
  );
}
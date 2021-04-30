import styles from 'pages/Admin/TagEditor';

const TagEditor = () => false;
export default TagEditor;

// 'brain' -> (1, 2)
// 'tree' -> (0)
// 'asdf' -> (0, 3)
// 'train' -> (0)

/* filter and search */
// console.table(
//     // [1, 2, 3, 4]
//     /*
//         function filter(array, condition_function) {
//             let result = [];

//             for (let index = 0; index < array.length; ++index) {
//                 if (condition_function(array[index])) {
//                     result.push(array[index]);
//                 }
//             }

//             return result;
//         }
//     */
//     // filter(function(item) -> bool)
// )

// articles.filter(
//   function (article) {

//   }
// );

const aref = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
/*
    Truthy values:
        Any non-zero number,
        Any valid reference
    Falsy values:
        null / undefined / 0.

        According to the ECMAScript 6 spec, empty string "" also counts.
*/
const tagList = ['tree', 'itch', 'horror', 'games', 'neptunia', 'leaves', 'funny', 'pad'];
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

// ['asdf', 'brain']
console.table(
  articles.filter(function (article) {
      
      if (article.tags.indexOf('brain' || 'asdf') !== -1) {
          return true;
      }
  })
);
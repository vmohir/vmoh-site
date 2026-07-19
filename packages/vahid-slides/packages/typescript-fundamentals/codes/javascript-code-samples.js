/* const and let */
const x = 2;
let y = 2;

/* Array methods */
let arr = [{ id: 'id1' }, { id: 'id2' }, { id: 'id3' }, { id: 'id4' }, { id: 'id5' }];
arr.forEach((item, index) => {
    console.log(item.id, index);
});
arr = arr.map(item => ({ ...item, value: item.id.charAt(2) }));
const sum = arr.reduce((result, item) => result + item.value, 0);
arr = arr.filter(item => item.value > 3);
arr.find(item => item.id === 'id2');
arr.some(item => item.value > 2);
arr.every(item => item.value < 5);

/* Mutation */
const originalData = [{ value: 1, list: [1, 2, 3] }, { value: 2, list: [4, 5, 6] }];
originalData[0].list[1] = 100;
originalData[1].value = 0;
const newData = originalData.slice();
const newData = [...originalData, { ...originalData[0], value: 3 }];

/* Backticks */
const world = 'World';
const helloWorld = `Hello ${world}`;

/* Destructing */
const { data: folanList, ...others } = response;
const [firstReqResponse, secondReqResponse] = responses;
function greet({ name, greeting }) {
    console.log(`${greeting}, ${name}!`);
}

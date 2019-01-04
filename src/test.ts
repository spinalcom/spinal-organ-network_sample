import { Model, Val, Ptr, spinalCore,
  TypedArray_Float64, TypedArray_Int32 } from 'spinal-core-connectorjs_type';

import { SpinalTimeSeriesArchiveDay, SpinalDateValue,
  SpinalDateValueArray } from './Model/timeseries/SpinalTimeSeriesArchiveDay';

const test = new SpinalTimeSeriesArchiveDay(2);

const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].reverse();
const arr1 = [1, 2, 3, 5, 6, 7, 8, 9, 4, 10];
for (const item of arr) {
  console.log('it', item);

  test.insert(arr1[item],  new Date().setHours(0, 0, 0, 0));
}
const sgghfhgf : SpinalDateValueArray = test.get();

const len = test.length.get();
for (let index = 0; index < len; index += 1) {
  const g = test.get(index);
  console.log(g);

}
// console.log(sgghfhgf);

// import { SpinalTimeSeriesArchive } from './Model/timeseries/SpinalTimeSeriesArchive';

// async function test() {
//   const test = new SpinalTimeSeriesArchive(2);

//   test.newArchiveDate();

// // console.log(test);
//   const dates = test.getDates();
// // console.log(dates);
//   const date = dates[0].get();
//   console.log(date);

//   try {
//     const arch = await test.getArchiveAtDate(date);
//     let arr = [1, 2, 3, 4, 5];
//     for (const item of arr) {
//       arch.push(item);
//     }

//     const d = Date.now();
//     setTimeout(async () => {
//       arr = [6, 7, 8, 9];
//       for (const item of arr) {
//         arch.push(item);
//       }
//       console.log('test', arch.get());
//       console.log('d =>', d);

//       console.log('=======');
//       for await (const data of test.getFromIntervalTimeGen(0, d)) {
//         console.log(data);
//       }

//       console.log('=======');
//       for await (const data of test.getFromIntervalTimeGen(d)) {
//         console.log(data);
//       }

//     },         200);

//   } catch (e) {
//     console.error(e);

//   }

// }

// test();

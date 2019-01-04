import {
  SpinalTimeSeries,
  SpinalTimeSeriesArchive,
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
  SpinalDateValueArray,
} from '../../../src/Model/timeseries/SpinalTimeSeries';

import * as tk from 'timekeeper';
tk.freeze(1546532599592);

import { testData } from './testData';

console.log(testData);

import * as assert from 'assert';

describe('SpinalTimeSeries', () => {
  let instanceTest: SpinalTimeSeries;
  describe('test on construnctor',  () => {

    it('Create with initilzed value', () => {
      instanceTest = new SpinalTimeSeries();
    });
  });

  describe('push Datas',  () => {

    it('create data from testData', async () => {
      for (let index = 0; index < testData.length; index += 1) {
        const element = testData[index];
        const dateKeys = element.date.keys();
        const valueKeys = element.value.keys();
        let date = dateKeys.next();
        let value = valueKeys.next();
        for (;
          date.done === false;
          date = dateKeys.next(), value = valueKeys.next()
          ) {
          tk.travel(element.date[date.value]);
          instanceTest.push(element.value[value.value]);
        }
      }
      const archive = await instanceTest.getArchive();
      console.log(archive.getDates().get());

      // console.log(await instanceTest.getFromIntervalTime(0, 2546532599592));

    });
  });

});

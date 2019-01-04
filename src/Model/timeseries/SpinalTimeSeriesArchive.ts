/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
import {
  Model,
  Ptr,
  spinalCore,
} from 'spinal-core-connectorjs_type';
import {
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
} from './SpinalTimeSeriesArchiveDay';

class SpinalTimeSeriesArchive extends Model {

  // synchronized
  private lstDate: spinal.Lst<spinal.Val>;
  private lstItem: spinal.Lst<spinal.Ptr<SpinalTimeSeriesArchiveDay>>;
  public initialBlockSize: spinal.Val;

  // not synchronized
  private itemLoadedDictionary: Map<number, Promise<SpinalTimeSeriesArchiveDay>>;

  constructor(initialBlockSize: number = 50) {
    super({
      initialBlockSize,
      lstDate: [],
      lstItem: [],
    });

    this.itemLoadedDictionary = new Map;
  }

  public static normalizeDate(date: number | string | Date) : number {
    return new Date(date).setHours(0, 0, 0, 0);
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getTodayArchive(): Promise<SpinalTimeSeriesArchiveDay> {
    const date = SpinalTimeSeriesArchive.normalizeDate(Date.now());
    const spinalTimeSeriesArchiveDay = this.itemLoadedDictionary.get(date);

    if (spinalTimeSeriesArchiveDay !== undefined) {
      return spinalTimeSeriesArchiveDay;
    }
    const value = new SpinalTimeSeriesArchiveDay(this.initialBlockSize.get());
    this.lstDate.push(date);
    this.lstItem.push(new Ptr(value));
    const prom = Promise.resolve(value);
    this.itemLoadedDictionary.set(date, prom);
    return prom;
  }

  /**
   * @param {(number|string)} [start=0]
   * @param {(number|string)} [end=Date.now()]
   * @returns {AsyncIterableIterator<SpinalDateValue>}
   * @memberof SpinalTimeSeriesArchive
   */
  public async *getFromIntervalTimeGen(
    start: number|string|Date = 0,
    end: number|string|Date = Date.now())
    : AsyncIterableIterator<SpinalDateValue> {
    const normalizedStart = SpinalTimeSeriesArchive.normalizeDate(start);
    const normalizedEnd = (typeof end === 'number' || typeof end === 'string') ?
      new Date(end).getTime() : end;

    for (let idx = 0; idx < this.lstDate.length; idx += 1) {
      const element = this.lstDate[idx].get();
      if (normalizedStart > element) continue;
      const archive = await this.getArchiveAtDate(element);
      let index = 0;
      const archiveLen = archive.length.get();
      if (normalizedStart === element) {
        for (; index < archiveLen; index += 1) {
          const dateValue = archive.get(index);
          if (dateValue.date >= start) {
            break;
          }
        }
      }

      for (; index < archiveLen; index += 1) {
        const dateValue = archive.get(index);
        if (dateValue.date > normalizedEnd) return;
        yield dateValue;
      }
    }
  }

  /**
   * getFromIntervalTimeGen is prefered.
   * @param {number} start
   * @param {(number|string)} [end=Date.now()]
   * @returns {Promise<SpinalDateValue[]>}
   * @memberof SpinalTimeSeriesArchive
   */
  public async getFromIntervalTime(start: number|string|Date, end: number|string|Date = Date.now()):
  Promise<SpinalDateValue[]> {
    const result = [];
    for await (const data of this.getFromIntervalTimeGen(start, end)) {
      result.push(data);
    }
    return result;
  }

  public getArchiveAtDate(date: number | string | Date): Promise<SpinalTimeSeriesArchiveDay> {
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(date);
    if (this.itemLoadedDictionary.has(normalizedDate)) {
      return this.itemLoadedDictionary.get(normalizedDate);
    }
    const idx = this.lstDate.indexOf(normalizedDate);
    if (idx < 0) return Promise.reject(new Error(`Date '${date}' not fond.`));

    const promise: Promise<SpinalTimeSeriesArchiveDay> = new Promise((resolve) => {
      const ptr: spinal.Ptr<SpinalTimeSeriesArchiveDay> = this.lstItem[idx];
      if (typeof ptr.data.model !== 'undefined') {
        resolve(ptr.data.model);
      } else {
        ptr.load((element: SpinalTimeSeriesArchiveDay) => {
          resolve(element);
        });
      }
    });
    this.itemLoadedDictionary.set(normalizedDate, promise);
    return promise;
  }

  /**
   * @returns {spinal.Lst<spinal.Val>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getDates(): spinal.Lst<spinal.Val> {
    return this.lstDate;
  }

  public dateExist(date: number | string | Date): boolean {
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(date);
    for (let idx = this.lstDate.length - 1; idx >= 0; idx -= 1) {
      if (this.lstDate[idx].get() === normalizedDate) return true;
    }
    return false;
  }
}

spinalCore.register_models(SpinalTimeSeriesArchive);

export default SpinalTimeSeriesArchive;
export { SpinalTimeSeriesArchive };

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
import { Model, Ptr, spinalCore, FileSystem } from 'spinal-core-connectorjs_type';
import { genUID } from '../../Utils/genUID';
import { SpinalTimeSeriesArchive } from './SpinalTimeSeriesArchive';
import {
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
  SpinalDateValueArray,
} from './SpinalTimeSeriesArchiveDay';

/**
 * @class SpinalTimeSeries
 * @property {spinal.Str} id
 * @property {spinal.Ptr<SpinalTimeSeriesArchive>} archive
 * @property {spinal.Ptr<SpinalTimeSeriesArchiveDay>} currentArchive
 * @extends {Model}
 */
class SpinalTimeSeries extends Model {
  id: spinal.Str;
  currentArchive: spinal.Ptr<SpinalTimeSeriesArchiveDay>;
  archive: spinal.Ptr<SpinalTimeSeriesArchive>;

  private archiveProm: Promise<SpinalTimeSeriesArchive>;
  private currentProm: Promise<SpinalTimeSeriesArchiveDay>;

  /**
   *Creates an instance of SpinalTimeSeries.
   * @memberof SpinalTimeSeries
   */
  constructor() {
    super();
    this.archiveProm = null;
    this.currentProm = null;
    if (FileSystem._sig_server === false) return;

    const archive = new SpinalTimeSeriesArchive();
    this.archiveProm = Promise.resolve(archive);

    this.add_attr({
      id: genUID('SpinalTimeSeries'),
      archive: new Ptr(archive),
      currentData: 0,
    });

    this.currentProm = archive.getTodayArchive();
    this.initCurrent();
  }
  /**
   * @private
   * @memberof SpinalTimeSeries
   */
  private async initCurrent() {
    const current = await this.currentProm;
    this.add_attr({
      currentArchive: new Ptr(current),
    });

  }

  /**
   * @param {(number|string|Date)} [start=0]
   * @param {(number|string|Date)} [end=Date.now()]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getFromIntervalTimeGen(
    start: number|string|Date = 0,
    end: number|string|Date = Date.now())
    : Promise<AsyncIterableIterator<SpinalDateValue>> {
    const archive = await this.getArchive();
    return archive.getFromIntervalTimeGen(start, end);
  }
  /**
   * @param {(number|string|Date)} [start=0]
   * @param {(number|string|Date)} [end=Date.now()]
   * @returns {Promise<SpinalDateValue[]>}
   * @memberof SpinalTimeSeries
   */
  public async getFromIntervalTime(
    start: number|string|Date = 0,
    end: number|string|Date = Date.now(),
    ): Promise<SpinalDateValue[]> {
    const archive = await this.getArchive();
    return archive.getFromIntervalTime(start, end);
  }
  /**
   * @returns {Promise<SpinalDateValue>}
   * @memberof SpinalTimeSeries
   */
  public async getCurrent(): Promise<SpinalDateValue> {
    const currentDay: SpinalTimeSeriesArchiveDay = await this.getCurrentDay();
    const len = currentDay.length.get();
    return currentDay.get(len - 1);
  }

  /**
   * @param {number} value
   * @returns {Promise<void>}
   * @memberof SpinalTimeSeries
   */
  async push(value: number): Promise<void> {
    let currentArchive: SpinalTimeSeriesArchiveDay = await this.getCurrentDay();
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(Date.now());
    if (currentArchive.dateDay.get() !== normalizedDate) {
      const archive = await this.getArchive();
      this.currentProm = archive.getTodayArchive();
      currentArchive = await this.currentProm;
    }
    currentArchive.push(value);
  }
  /**
   * @param {(number | string | Date)} date
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeries
   */
  public async getDataOfDay(date: number | string | Date): Promise<SpinalTimeSeriesArchiveDay> {
    const archive = await this.getArchive();
    return archive.getArchiveAtDate(date);
  }

  loadPtr(ptr: spinal.Ptr<SpinalTimeSeriesArchiveDay>)
  : Promise<SpinalTimeSeriesArchiveDay>;
  loadPtr(ptr: spinal.Ptr<SpinalTimeSeriesArchive>)
  : Promise<SpinalTimeSeriesArchive>;
  loadPtr(ptr: spinal.Ptr<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive>)
  : Promise<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive> {
    if (typeof ptr.data.model !== 'undefined') {
      return Promise.resolve(ptr.data.model);
    }
    return new Promise((resolve) => {
      ptr.load((element) => {
        resolve(element);
      });
    });
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchive>}
   * @memberof SpinalTimeSeries
   */
  async getArchive(): Promise<SpinalTimeSeriesArchive> {
    if (this.archiveProm !== null) return this.archiveProm;
    this.archiveProm = this.loadPtr(this.archive);
    return this.archiveProm;
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeries
   */
  async getCurrentDay(): Promise<SpinalTimeSeriesArchiveDay> {
    if (this.currentProm !== null) return this.currentProm;
    this.currentProm = this.loadPtr(this.currentArchive);
    return this.currentProm;
  }

  /**
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getDataFromYesterday()
    : Promise<AsyncIterableIterator<SpinalDateValue>> {
    const archive = await this.getArchive();
    const end = new Date().setHours(0, 0, 0, -1);
    const start = new Date(end).setHours(0, 0, 0, 0);
    return archive.getFromIntervalTimeGen(start, end);
  }

  /**
   * @alias getDataFromLastDays(1)
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public getDataFromLast24Hours()
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    return this.getDataFromLastDays(1);
  }

  /**
   * @param {number} [numberOfHours=1]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getDataFromLastHours(numberOfHours: number = 1)
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    const archive = await this.getArchive();
    const end = Date.now();
    const start = new Date();
    start.setHours(start.getHours() - numberOfHours);
    return archive.getFromIntervalTimeGen(start, end);
  }
  /**
   * @param {number} [numberOfDays=1]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getDataFromLastDays(numberOfDays: number = 1)
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    const archive = await this.getArchive();
    const end = Date.now();
    const start = new Date();
    start.setDate(start.getDate() - numberOfDays);
    return archive.getFromIntervalTimeGen(start, end);
  }

}

spinalCore.register_models(SpinalTimeSeries);

export default SpinalTimeSeries;
export {
  SpinalTimeSeries,
  SpinalTimeSeriesArchive,
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
  SpinalDateValueArray,
};

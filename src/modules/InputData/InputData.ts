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
  InputDataDevice,
  InputDataEndpoint,
  InputDataEndpointGroup,
} from './InputDataModel/InputDataModel';

type onDataFunctionType = (obj: InputDataDevice) => void;

/**
 * Simulation Class to generate data from an extrenal source
 *
 * @class InputData
 */
class InputData {
  /**
   * @private
   * @type {onDataFunctionType}
   * @memberof InputData
   */
  private onData: onDataFunctionType;

  /**
   * @private
   * @type {InputDataDevice[]}
   * @memberof InputData
   */
  private devices: InputDataDevice[];

  /**
   *Creates an instance of InputData.
   * @memberof InputData
   */
  constructor() {
    const intervalTest = 4000;
    this.devices = [];
    this.onData = null;
    this.generateData();
    setInterval(this.onDataInterval.bind(this), intervalTest);
  }

  /**
   * @private
   * @memberof InputData
   */
  private onDataInterval() {
    if (this.onData !== null) {
      this.onData(this.getAndUpdateOneRandomDevice());
    }
  }

  /**
   * @param {onDataFunctionType} onData
   * @memberof InputData
   */
  public setOnDataCBFunc(onData: onDataFunctionType): void {
    this.onData = onData;
  }

  /**
   * @private
   * @memberof InputData
   */
  private generateData() {
    this.devices.push(this.generateDataDevice(1));
    this.devices.push(this.generateDataDevice(2));
    this.devices.push(this.generateDataDevice(3));
  }

  /**
   * @private
   * @returns {InputDataDevice}
   * @memberof InputData
   */
  private generateDataDevice(id : number): InputDataDevice {
    const res: InputDataDevice = new InputDataDevice(`DEVICE ${id}`);

    const CHILD_1: InputDataDevice = new InputDataDevice(`DEVICE ${id} CHILD_1 - device`);
    const CHILD_1_1: InputDataEndpointGroup =
      new InputDataEndpointGroup(`DEVICE ${id} CHILD_1_1 group`);
    const CHILD_1_1_1: InputDataEndpoint =
      new InputDataEndpoint(`DEVICE ${id} CHILD_1_1_1 endpoint`);
    const CHILD_1_2: InputDataEndpoint = new InputDataEndpoint(`DEVICE ${id} CHILD_1_2 endpoint`);
    CHILD_1.children.push(CHILD_1_1, CHILD_1_2);
    CHILD_1_1.children.push(CHILD_1_1_1);

    const CHILD_2: InputDataEndpointGroup =
      new InputDataEndpointGroup(`DEVICE ${id} CHILD_2 group`);
    const CHILD_2_1: InputDataEndpoint = new InputDataEndpoint(`DEVICE ${id} CHILD_2_1 endpoint`);
    CHILD_2.children.push(CHILD_2_1);

    const CHILD_3: InputDataEndpoint = new InputDataEndpoint(`DEVICE ${id} CHILD_3 endpoint`);
    res.children.push(CHILD_1, CHILD_2, CHILD_3);

    return res;
  }

  /**
   * @private
   * @param {(InputDataDevice|InputDataEndpointGroup)} deviceOrEnpointGroup
   * @memberof InputData
   */
  private updateDevice(deviceOrEnpointGroup: InputDataDevice|InputDataEndpointGroup): void {
    for (const child of deviceOrEnpointGroup.children) {
      if (child instanceof InputDataEndpoint) {
        child.currentValue = Math.floor(Math.random() * 100);
      } else if (child instanceof InputDataDevice || child instanceof InputDataEndpointGroup) {
        this.updateDevice(child);
      }
    }
  }

  /**
   * @private
   * @returns {InputDataDevice}
   * @memberof InputData
   */
  private getAndUpdateOneRandomDevice(): InputDataDevice {
    if (this.devices.length > 0) {
      const idx = Math.floor(Math.random() * this.devices.length);
      this.updateDevice(this.devices[idx]);
      return this.devices[idx];
    }
    this.generateData();
    return this.getAndUpdateOneRandomDevice();
  }
}

export { InputData };

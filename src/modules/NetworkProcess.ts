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

import { ForgeFileItem } from 'spinal-lib-forgefile';
import { InputData } from './InputData/InputData';
import { NetworkService } from './NetworkService';
import {
  InputDataDevice,
  InputDataEndpoint,
  InputDataEndpointGroup,
  InputDataEndpointDataType,
} from './InputData/InputDataModel/InputDataModel';

import {
  SpinalGraphService,
} from 'spinal-env-viewer-graph-service';
import {
  SpinalBmsDevice,
  SpinalBmsEndpoint,
  SpinalBmsEndpointGroup,
} from '../Model/bms-network/SpinalBms';

import { ConfigOrgan } from '../Utils/ConfigOrgan';

class NetworkProcess {
  private inputData: InputData;
  private nwService : NetworkService;
  private contextId: string;
  private networkId: string;

  constructor(inputData: InputData) {
    this.inputData = inputData;
    this.nwService = new NetworkService;
  }

  public async init(forgeFile: ForgeFileItem, configOrgan : ConfigOrgan)
  : Promise<void> {

    const resultInit = await this.nwService.init(forgeFile, configOrgan);
    this.contextId = resultInit.contextId;
    this.networkId = resultInit.networkId;
    this.inputData.setOnDataCBFunc(this.updateData.bind(this));
  }

  public async updateData(obj: InputDataDevice): Promise<void> {
    const contextChildren =
      await SpinalGraphService.getChildrenInContext(this.networkId, this.contextId);

    for (const child of contextChildren) {
      if (typeof child.idNetwork !== 'undefined' && child.idNetwork.get() === obj.id) {
        return this.updateModel(child, obj);
      }
    }
    return this.nwService.createNewBmsDevice(this.networkId, obj).then((child) => {
      return this.updateModel(child, <InputDataDevice>obj);
    });
  }

  private async updateModel(node: any,
                            reference: InputDataDevice | InputDataEndpointGroup,
    ): Promise<void> {
    const contextChildren =
      await SpinalGraphService.getChildrenInContext(node.id.get(), this.contextId);
    const notPresent = [];
    const promises : Promise<void>[] = [];

    for (const refChild of reference.children) {
      let childFound = false;
      for (const child of contextChildren) {
        if (child.idNetwork.get() === refChild.id) {
          switch (child.type.get()) {
            case SpinalBmsDevice.nodeTypeName:
              promises.push(this.updateModel(child, <InputDataDevice>refChild));
              childFound = true;
              break;
            case SpinalBmsEndpointGroup.nodeTypeName:
              promises.push(this.updateModel(child, <InputDataEndpointGroup>refChild));
              childFound = true;
              break;
            case SpinalBmsEndpoint.nodeTypeName:
              promises.push(this.updateEndpoint(child, <InputDataEndpoint>refChild));
              childFound = true;
              break;
            default:
              break;
          }
        }
      }
      if (!childFound) {
        notPresent.push(refChild);
      }
    }

    let prom: Promise<any>;
    for (const item of notPresent) {
      switch (true) {
        case item instanceof InputDataDevice:
          prom = this.nwService.createNewBmsDevice(node.id.get(), item).then((child) => {
            return this.updateModel(child, <InputDataDevice>item);
          });
          promises.push(prom);
          break;
        case item instanceof InputDataEndpointGroup:
          prom = this.nwService.createNewBmsEndpointGroup(node.id.get(), item).then((child) => {
            return this.updateModel(child, <InputDataEndpointGroup>item);
          });
          promises.push(prom);
          break;
        case item instanceof InputDataEndpoint:
          prom = this.nwService.createNewBmsEndpoint(node.id.get(), item).then((child) => {
            return this.updateEndpoint(child, <InputDataEndpoint>item);
          });
          promises.push(prom);
          break;
        default:
          break;
      }
    }
    await Promise.all(promises);
  }

  private async updateEndpoint(node: any, reference: InputDataEndpoint): Promise<void> {
    const element: SpinalBmsEndpoint = await node.element.load();

    element.currentValue.set(reference.currentValue);
    // update TimeSeries here

  }

}

export { NetworkProcess };

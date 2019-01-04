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
  SpinalGraphService,
  SpinalContext,
  SPINAL_RELATION_TYPE,
} from 'spinal-env-viewer-graph-service';
import { ForgeFileItem } from 'spinal-lib-forgefile';
import {
  InputDataDevice,
  InputDataEndpoint,
  InputDataEndpointGroup,
  InputDataEndpointDataType,
} from './InputData/InputDataModel/InputDataModel';
import {
  SpinalBmsDevice,
  SpinalBmsNetwork,
  SpinalBmsEndpoint,
  SpinalBmsEndpointGroup,
} from '../Model/bms-network/SpinalBms';
import { ConfigOrgan } from '../Utils/ConfigOrgan';

class NetworkService {
  private context: SpinalContext;
  private contextId: string;
  constructor() {
  }

  public async init(forgeFile: ForgeFileItem, configOrgan: ConfigOrgan)
  : Promise<{contextId:string, networkId: string}> {
    await SpinalGraphService.setGraphFromForgeFile(forgeFile);

    this.context = SpinalGraphService.getContext(configOrgan.contextName);
    if (this.context === undefined) {
      this.context =
        await SpinalGraphService.addContext(configOrgan.contextName, configOrgan.contextType);
    }
    this.contextId = this.context.getId().get();

    const childrenContext =
      await SpinalGraphService.getChildrenInContext(this.contextId, this.contextId);
    let childFoundId: string = '';
    for (const childContext of childrenContext) {
      if (typeof childContext.name !== 'undefined' &&
      childContext.networkName.get() === configOrgan.networkName) {
        childFoundId = childContext.id.get();
        break;
      }
    }
    if (childFoundId === '') {
      childFoundId = await this.createNewBmsNetwork(
          this.contextId,
          configOrgan.networkType,
          configOrgan.networkName,
          ).then(res => <string>res.id.get());
    }
    return { contextId:this.contextId, networkId: childFoundId };
  }

  public async createNewBmsNetwork(parentId: string, typeName: string, networkName: string)
  : Promise<any> {
    const res = new SpinalBmsNetwork(
      networkName,
      typeName,
    );
    const tmpInfo = {
      networkName,
      typeName,
      type:'BmsNetwork',
      name: typeName,
      idNetwork: res.id.get(),
    };
    const childId = SpinalGraphService.createNode(tmpInfo, res);
    await SpinalGraphService.addChildInContext(
      parentId,
      childId,
      this.contextId,
      SpinalBmsDevice.relationName,
      SPINAL_RELATION_TYPE,
      );
    return SpinalGraphService.getInfo(childId);
  }

  public async createNewBmsDevice(parentId: string, obj: InputDataDevice): Promise<any> {
    const res = new SpinalBmsDevice(
      obj.name,
      obj.type,
      obj.path,
      obj.id,
    );
    const tmpInfo = { type:'BmsDevice', name: obj.name, idNetwork: obj.id };
    const childId = SpinalGraphService.createNode(tmpInfo, res);
    await SpinalGraphService.addChildInContext(
      parentId,
      childId,
      this.contextId,
      SpinalBmsDevice.relationName,
      SPINAL_RELATION_TYPE,
      );
    return SpinalGraphService.getInfo(childId);
  }

  public async createNewBmsEndpointGroup(parentId: string, obj: InputDataEndpointGroup)
  : Promise<any> {
    const res = new SpinalBmsEndpointGroup(
      obj.name,
      obj.type,
      obj.path,
      obj.id,
    );
    const tmpInfo = { type:SpinalBmsEndpointGroup.nodeTypeName, name: obj.name, idNetwork: obj.id };
    const childId = SpinalGraphService.createNode(tmpInfo, res);
    await SpinalGraphService.addChildInContext(
      parentId,
      childId,
      this.contextId,
      SpinalBmsEndpointGroup.relationName,
      SPINAL_RELATION_TYPE,
      );
    return SpinalGraphService.getInfo(childId);

  }

  public async createNewBmsEndpoint(parentId: string, obj: InputDataEndpoint)
  : Promise<any> {
    const res = new SpinalBmsEndpoint(
      obj.name,
      obj.path,
      obj.currentValue,
      obj.unit,
      InputDataEndpointDataType[obj.dataType],
      obj.id,
    );
    const tmpInfo = { type:SpinalBmsEndpoint.nodeTypeName, name: obj.name, idNetwork: obj.id };
    const childId = SpinalGraphService.createNode(tmpInfo, res);
    await SpinalGraphService.addChildInContext(
      parentId,
      childId,
      this.contextId,
      SpinalBmsEndpoint.relationName,
      SPINAL_RELATION_TYPE,
      );
    return SpinalGraphService.getInfo(childId);
  }
}

export default NetworkService;
export  { NetworkService };

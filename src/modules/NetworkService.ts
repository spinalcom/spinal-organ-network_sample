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
  SpinalNode,
  SPINAL_RELATION_TYPE,
} from 'spinal-env-viewer-graph-service';
import { ForgeFileItem } from 'spinal-lib-forgefile';
import {
  InputDataDevice,
  InputDataEndpoint,
  InputDataEndpointGroup,
  InputDataEndpointDataType,
} from './InputData/InputDataModel/InputDataModel';
import { Model } from 'spinal-core-connectorjs_type';
import {
  SpinalBmsDevice,
  SpinalBmsEndpoint,
  SpinalBmsEndpointGroup,
} from '../Model/bms-network/SpinalBms';

class NetworkService {
  private context: SpinalContext;
  private contextId: string;
  constructor() {
  }

  public async init(forgeFile: spinal.Model, contextName: string, contextType: string)
  : Promise<string> {
    await SpinalGraphService.setGraphFromForgeFile(forgeFile);

    this.context = SpinalGraphService.getContext(contextName);
    if (this.context === undefined) {
      this.context = await SpinalGraphService.addContext(contextName, contextType);
    }
    this.contextId = this.context.getId().get();

    return this.contextId;
  }

  public async createNewBmsDevice(parentId: string, obj: InputDataDevice): Promise<any> {
    const res = new SpinalBmsDevice(
      obj.id,
      obj.name,
      obj.type,
      obj.path,
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
      obj.id,
      obj.name,
      obj.type,
      obj.path,
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
      obj.id,
      obj.name,
      obj.path,
      obj.currentValue,
      obj.unit,
      InputDataEndpointDataType[obj.dataType],
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

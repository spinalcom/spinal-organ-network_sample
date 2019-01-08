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

import { SpinalBmsEndpoint } from 'spinal-model-bmsnetwork';
import {
  InputDataEndpoint as idEndpoint,
  InputDataEndpointDataType,
  InputDataEndpointType,
} from 'spinal-service-bmsnetwork';

import { genUID } from '../../../Utils/genUID';

export class InputDataEndpoint implements idEndpoint {
  public id: string;
  public name: string;
  public path: string;
  public currentValue: number | string;
  public unit: string;
  public dataType: InputDataEndpointDataType;
  public type: InputDataEndpointType;
  public nodeTypeName: string;

  constructor(
    name: string = 'default endpoint name',
    currentValue: number | string = 0,
    unit: string = 'unit',
    dataType: InputDataEndpointDataType = InputDataEndpointDataType.Integer,
    type: InputDataEndpointType = InputDataEndpointType.Other,
    id: string = genUID('InputDataEndpoint'),
    path: string = 'default endpoint path',
  ) {
    this.nodeTypeName = SpinalBmsEndpoint.nodeTypeName;
    this.id = id;
    this.name = name;
    this.type = type;
    this.path = path;
    this.currentValue = currentValue;
    this.unit = unit;
    this.dataType = dataType;
  }
}

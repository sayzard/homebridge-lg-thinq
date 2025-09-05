import { Categories } from 'homebridge';
import {Device} from './lib/Device';
import AirPurifier from './devices/AirPurifier';
import Refrigerator from './devices/Refrigerator';
import WasherDryer from './devices/WasherDryer';
import Dishwasher from './devices/Dishwasher';
import Dehumidifier from './devices/Dehumidifier';
import {default as V1helper} from './v1/helper';
import {PlatformType} from './lib/constants';
import AirConditioner from './devices/AirConditioner';
import AeroTower from './devices/AeroTower';
import Styler from './devices/Styler';
import RangeHood from './devices/RangeHood';
import Oven from './devices/Oven';
import Microwave from './devices/Microwave';
import WasherDryer2 from './devices/WasherDryer2';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class Helper {
  public static make(device: Device) {
    if (device.platform === PlatformType.ThinQ1) {
      // check if thinq1 available
      return V1helper.make(device);
    }

    // thinq2
    switch (device.type) {
      case 'AERO_TOWER': return AeroTower;
      case 'AIR_PURIFIER': return AirPurifier;
      case 'REFRIGERATOR': return Refrigerator;
      case 'WASHER':
      case 'WASHER_NEW':
      case 'WASH_TOWER':
      case 'DRYER':
        return WasherDryer;
      case 'WASH_TOWER_2': return WasherDryer2; // new kind of washer
      case 'DISHWASHER': return Dishwasher;
      case 'DEHUMIDIFIER': return Dehumidifier;
      case 'AC': return AirConditioner;
      case 'STYLER': return Styler;
      case 'HOOD': return RangeHood;
      case 'MICROWAVE': return Microwave;
      case 'OVEN': {
        // Some models are reported as OVEN (301) but expose Microwave-like LWO* keys under snapshot.ovenState
        // Route those to Microwave implementation to avoid undefined access (upper* vs LWO* fields)
        const snapshot = (device as any).data?.snapshot?.ovenState;
        const hasLWOKeys = snapshot && (typeof snapshot.LWOState !== 'undefined'
          || Object.keys(snapshot).some((k: string) => k.startsWith('LWO')));
        const deviceCode = (device as any).data?.deviceCode;
        if (hasLWOKeys || deviceCode === 'KI04') {
          return Microwave;
        }
        return Oven;
      }
    }

    return null;
  }

  public static category(device: Device) {
    switch (device.type) {
      case 'AIR_PURIFIER': return Categories.AIR_PURIFIER;
      case 'DEHUMIDIFIER': return Categories.AIR_DEHUMIDIFIER;
      case 'AC': return Categories.AIR_CONDITIONER;
      case 'DISHWASHER': return 1/*Sprinkler*/;
      case 'OVEN': return 9/*Thermostat*/;
      case 'MICROWAVE': return 9/*air heater*/;
      default: return Categories.OTHER;
    }
  }
}

export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

export function mergeDeep(target, ...sources) {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export function fToC(fahrenheit) {
  return parseFloat(((fahrenheit - 32) * 5 / 9).toFixed(1));
}

export function cToF(celsius) {
  return Math.round(celsius * 9 / 5 + 32);
}

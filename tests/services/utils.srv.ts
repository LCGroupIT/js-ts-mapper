import { ComponentVariant1, ComponentVariant1ArrayItem, ComponentArrayItem } from '../models/hierachy-components';
import { DateConverter } from '../converters/date-converter';
export class UtilTestTools {
  static expectEqual(a, b) {
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  }

  static getHierachyTestClientObject() {
     let dateConverter = new DateConverter();
     let out = new ComponentVariant1({
        componentProperty: 'value',
        items: [
            new ComponentVariant1ArrayItem({
                componentArrayItemProperty1: 'value',
                componentArrayItemProperty2: 256,
                componentArrayItemProperty3: dateConverter.deserialize('2018-11-03T21:00:00.000Z'),
                componentArrayItemProperty4: { id: 212, name: 'name' }
              }),
            new ComponentVariant1ArrayItem({
                componentArrayItemProperty1: 'value',
                componentArrayItemProperty2: 256,
                componentArrayItemProperty3: dateConverter.deserialize('2018-11-03T21:00:00.000Z'),
                componentArrayItemProperty4: { id: 212, name: 'name' }
              })
        ],
        componentLevel3Property1: 'value',
        componentLevel3Property2: 253,
        componentLevel3Property3: dateConverter.deserialize('2018-11-03T21:00:00.000Z'),
        componentLevel3Property4: { id: 212, name: 'name' },
        componentArray3: [
            new ComponentArrayItem({
                componentArrayItemProperty1: 'value',
                componentArrayItemProperty2: 256,
                componentArrayItemProperty3: dateConverter.deserialize('2018-11-03T21:00:00.000Z'),
                componentArrayItemProperty4: { id: 212, name: 'name' }
              }),
              new ComponentArrayItem({
                componentArrayItemProperty1: 'value',
                componentArrayItemProperty2: 256,
                componentArrayItemProperty3: dateConverter.deserialize('2018-11-03T21:00:00.000Z'),
                componentArrayItemProperty4: { id: 212, name: 'name' }
              })
        ],        
        componentLevel2Property1: 'value',
        componentLevel2Property2: 253,
        componentLevel2Property3: dateConverter.deserialize('2018-11-03T21:00:00.000Z'),
        componentLevel1Property4: { id: 212, name: 'name' }
     });
    return out;
  }
}


function getControlSumm(entity) {
    return Array.prototype.map.call(JSON.stringify(entity), p => p.charCodeAt()).reduce((a, b) => a + b, 0);
}
import { JsTsMapper } from 'ts-mapper';

import { Employeer3, Employeer2 } from '../../../models/employeer';
import { UtilTestTools } from '../../../services/utils.srv';

export function run(mapper: JsTsMapper) {
    it('deserialize null to null value', () => {
        let test_entity = {
            id: 5,
            firstName: null,
            lastName: null,
            middleName: false
        };
        let result = {
            id: 5,
            firstName: null,
            lastName: null,
            middleName: false
        };

        let out = mapper.deserialize(result, Employeer3);
        UtilTestTools.expectEqual(out, test_entity);
    });

    it('deserialize null to undefined value', () => {
        let test_entity = new Employeer2({
            id: 5,
            firstName: undefined,
            lastName: undefined,
            middleName: 'Тестович',
            selected: true
        });

        let result = {
            Id: 5,
            FirstName: null,
            LastName: null,
            MiddleName: 'Тестович'
        };

        let out = mapper.deserialize(result, Employeer2);
        UtilTestTools.expectEqual(out, test_entity);
    });
}

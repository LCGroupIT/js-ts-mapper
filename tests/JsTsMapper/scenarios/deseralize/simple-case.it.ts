import { JsTsMapper } from 'ts-mapper';
import { ClientComponent } from '../../../models/client-component';
import { UtilTestTools } from '../../../services/utils.srv';

export function run(mapper: JsTsMapper) {
    it('simple deserialize', () => {
        let test_entity = {
            gender: 2,
            card: false,
            id: 5,
            name: 'Test',
            phone: undefined,
            comments: ['comment1', 'comment2', 'comment3'],
            roleIds: [115, 2225, 5552, 5555]
        };
        let result = {
            Id: 5,
            Name: 'Test',
            Gender: 2,
            Card: false,
            Phone: null,
            Comments: ['comment1', 'comment2', 'comment3'],
            RoleIds: [115, 2225, 5552, 5555]
        };

        let out: ClientComponent = mapper.deserialize(result, ClientComponent);
        UtilTestTools.expectEqual(out, test_entity);

        let test_entity1 = {
            gender: 2,
            card: false,
            id: 5,
            name: 'Test',
            phone: undefined,
            comments: ['comment1', 'comment2', 'comment3'],
            roleIds: [new Number(115), new Number(2225), new Number(5552), new Number(5555)]
        };

        result = {
            Id: 5,
            Name: 'Test',
            Gender: 2,
            Card: false,
            Phone: null,
            Comments: ['comment1', 'comment2', 'comment3'],
            RoleIds: [115, 2225, 5552, 5555]
        };

        out = mapper.deserialize(result, ClientComponent);
        UtilTestTools.expectEqual(out, test_entity1);
    });
}

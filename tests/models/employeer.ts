import { SerializeOnlyDecorated, JsonProperty, DeserializeNullValueDecorated } from '../../src/decorators';

@SerializeOnlyDecorated()
export class Employeer {
    constructor(o) {
        Object.assign(this, o);
    }

    @JsonProperty('Id')
    id: number;

    @JsonProperty('FirstName')
    firstName: string;

    @JsonProperty('LastName')
    lastName: string;

    @JsonProperty('MiddleName')
    middleName: string;

    selected: boolean = true;
}

export class Employeer2 {
    constructor(o) {
        Object.assign(this, o);
    }

    @JsonProperty('Id')
    id: number;

    @JsonProperty('FirstName')
    firstName: string;

    @JsonProperty('LastName')
    lastName: string;

    @JsonProperty('MiddleName')
    middleName: string;

    selected: boolean = true;
}

@DeserializeNullValueDecorated()
export class Employeer3 {
    constructor(o) {
        Object.assign(this, o);
    }

    @JsonProperty()
    id: number;

    @JsonProperty()
    firstName: string;

    @JsonProperty()
    lastName: string;

    @JsonProperty()
    middleName: string;
}

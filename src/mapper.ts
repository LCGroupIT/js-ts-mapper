import { AvailableFieldsMetadataKey, ServerNameMetadataKey, IgnoreUndecoratedPropertyKey } from './config';
import { FieldProperty } from './field-property';
import { getHash } from './decorators';

const ignoreUndecoratedPropertyDefault = false;
/**
 * Класс реализующий маппинг
 */
export class JsTsMapper {
    /**
     * Маппинг класса на объект
     * @param obj Класс, который необходимо с маппить на объект
     */
    serialize<T>(obj: T): Object {
        const serverObj = {};

        if (isPrimitive(obj)) {
            return <T>obj;
        }

        const target = Object.getPrototypeOf(obj);
        let hash = getHash(target.constructor);
        let availableNames: Array<FieldProperty> = Reflect.getMetadata(AvailableFieldsMetadataKey, target, hash) as [FieldProperty];
        if (availableNames instanceof Array) {
            /** Клонируем массив из метаданных, так как он далее будет меняться. В самих метаданных он должен оставаться неизменным. */
            availableNames = availableNames.slice();
        }

        /**
         *  Извлекаем флаг, нужно ли игнорировать недекорированные поля
         */
        let ignoreUndecoratedProp = Reflect.getMetadata(IgnoreUndecoratedPropertyKey, target.constructor);
        if (typeof ignoreUndecoratedProp !== 'boolean') {
            ignoreUndecoratedProp = ignoreUndecoratedPropertyDefault;
        }

        if (ignoreUndecoratedProp === false) {
            Object.assign<Object, T>(serverObj, obj);
        }

        /**
         * Вытаскиваем правила всех родительских объектов
         */
        setAvailableFieldsMetadata(target, availableNames);

        if (!availableNames) {
            return obj;
        }

        availableNames.forEach(field => {
            const serverName = Reflect.getMetadata(ServerNameMetadataKey, target, field.name);
            if (!serverName) {
                return;
            }
            if (obj.hasOwnProperty(field.name)) {
                const clientVal = obj[field.name];
                let serverVal;
                const propType = Reflect.getMetadata('design:type', target, field.name);                
                let hash = getHash(propType.prototype.constructor);
                const propTypeServerFields = Reflect.getMetadata(AvailableFieldsMetadataKey, propType.prototype, hash) as [
                    FieldProperty
                ];

                if (clientVal instanceof Array) {
                    serverVal = this.serializeArray<T>(clientVal);
                    serverObj[serverName] = serverVal;
                } else {
                    if (clientVal && propTypeServerFields) {
                        serverVal = this.serialize<T>(clientVal);
                    } else {
                        serverVal = clientVal;
                    }

                    if (field.converter) {
                        serverObj[serverName] = field.converter.serialize(serverVal);
                    } else {
                        serverObj[serverName] = serverVal;
                    }
                }
                /** 
                 * Вычищаем из выходного объекта обработанные поля
                 */
                if (field.name !== serverName && ignoreUndecoratedProp === false) {
                    delete serverObj[field.name];
                }
            }
        });

        return serverObj;
    }

    /**
     * Маппинг массива классов
     * @param array
     */
    serializeArray<T>(array: Array<T>): Array<Object> {
        if (isPrimitive(array)) {
            return <any>array;
        }
        return array.map((item: T) => this.serialize(item)) as Array<Object>;
    }

    /**
     * Маппинг объекта на класс
     * @param obj Объект, который необходимо с маппить на класс
     * @param type Тип класса, который будет заполнен значениями оз объекта
     */
    deserialize<T>(obj: Object, type: { new (...args): T }): T {
        if (isPrimitive(obj)) {
            return <T>obj;
        }

        /**
         * Создаем объект, с помощью конструктора, переданного в параметре type
         */
        const clientObj: T = new type();
        
        /**
         * Получаем контейнер с метаданными
         */
        const target = Object.getPrototypeOf(clientObj);
        /**
         * Получаем из метаданных, какие декорированные свойства есть в классе
         */
        let hash = getHash(target.constructor);
        let availableNames: Array<FieldProperty> = Reflect.getMetadata(AvailableFieldsMetadataKey, target, hash) as [FieldProperty];
        if (availableNames instanceof Array) {
            /** Клонируем массив из метаданных, так как он далее будет меняться. В самих метаданных он должен оставаться неизменным. */
            availableNames = availableNames.slice();
        }

        /**
         *  Извлекаем флаг, нужно ли игнорировать недекорированные поля
         */
        let ignoreUndecoratedProp = Reflect.getMetadata(IgnoreUndecoratedPropertyKey, target.constructor);
        if (typeof ignoreUndecoratedProp !== 'boolean') {
            ignoreUndecoratedProp = ignoreUndecoratedPropertyDefault;
        }

        if (ignoreUndecoratedProp === false) {
            Object.assign<T, Object>(clientObj, obj);
        }

        if (!availableNames) {
            return clientObj;
        }
        
        /**
         * Вытаскиваем правила всех родительских объектов
         */
        setAvailableFieldsMetadata(target, availableNames);

         /**
         * Обрабатываем каждое свойство
         */
        availableNames.forEach((field: FieldProperty) => {
            /**
             * Получаем из метаданных имя свойства в JSON
             */
            const serverName = Reflect.getMetadata(ServerNameMetadataKey, target, field.name);
            if (!serverName) {
                return;
            }
            /**
             * Получаем значение, переданное сервером
             */
            const serverVal = obj[serverName];
            let clientVal = null;
            /**
             * Проверяем, используются ли в классе свойства декораторы @JsonProperty
             * Получаем конструктор класса
             */
            const propType = Reflect.getMetadata('design:type', target, field.name);
            if (propType === Array) {
                clientVal = this.deserializeArray(serverVal, field);
            } else {
                /**
                 * Смотрим, есть ли в метаданных класса информация о свойствах
                 */
                                
                let hash = getHash(propType.prototype.constructor);
                const propTypeServerFields = Reflect.getMetadata(AvailableFieldsMetadataKey, propType.prototype, hash) as [
                    FieldProperty
                ];
                if (propTypeServerFields) {
                    /**
                     * Да, класс использует наш декоратор, обрабатываем свойство рекурсивно
                     */
                    clientVal = this.deserialize(serverVal, propType);
                } else {
                    /**
                     * Проверяем, есть ли кастомный конвертер, если есть, то преобразовываем значение
                     */
                    if (field.converter) {
                        clientVal = field.converter.deserialize(serverVal);
                    } else {
                        clientVal = serverVal;
                    }
                }
                /**
                 * Записываем результирующее значение
                 */
            }

            /** 
             * Вычищаем из выходного объекта обработанные поля
             */
            if (field.name !== serverName && ignoreUndecoratedProp === false) {
                delete clientObj[serverName];
            }
            clientObj[field.name] = clientVal;
        });
        return clientObj;
    }

    /**
     * Маппинг массива объектов
     * @param array Массив объектов
     * @param type Тип класса
     */
    deserializeArray<T>(array: Array<object>, field: FieldProperty | { new (...args): any }): Array<T> {
        if (isPrimitive(array)) {
            return <any>array;
        }
        let type: { new (...args): any };
        if (field instanceof FieldProperty) {
            type = field.type;
        } else {
            type = field;
        }
        return array.map(item => (type ? this.deserialize(item, type) : item)) as Array<T>;
    }
}

/**
 * Функция на проверку на примитив
 * @param value Значение любого типа
 * @returns {boolean}
 */
function isPrimitive(value: any) {
    return value !== Object(value);
}

/**
 * Разматывает объект по прототипам и получает доступные свойства
 * @param target Объект, свойства которого получаем
 * @param dest Массив, куда будут помещены доступные свойства.
 * @returns {Array}
 */
function setAvailableFieldsMetadata(target: any, dest: Array<any> = []) { 
    if (!target) {
        return dest;
    }   
    let proto = Object.getPrototypeOf(target);
    if (!proto) {
        return dest;
    }
    while (proto && proto.constructor && proto.constructor.name !== 'Object') {    
        /**
         * Извлекаем ключ конструктора у каждого из прототипов он уникален
         */
        let hash = getHash(proto.constructor);
        dest.push(
            ...(Reflect.getMetadata(AvailableFieldsMetadataKey, proto, hash) as [FieldProperty])
        );
        proto = proto.__proto__;
    }
    return dest;
}
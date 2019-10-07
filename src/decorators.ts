import 'reflect-metadata';

import {
    AvailableFieldsMetadataKey,
    DeserializeNullValue,
    HashPropertyKey,
    IgnoreUndecoratedPropertyKey,
    ServerNameMetadataKey,
} from './config';
import { FieldProperty } from './field-property';
import { BaseJsTsCustomConvert, JsTsCustomConvert } from './interface';

/**
 * Декоратор с помощью которого объявляем, свойство дял маппинга
 * @param name Имя свойства в объекте
 * @param customConverter Конвертер, специфичным образом прообразующее значение
 */
export function JsonProperty(name?: string, customConverter?: { new (): BaseJsTsCustomConvert } | [{ new (...arg): any }]) {
    return (target: Object, propertyKey: string) => {
        /**
         * Сохраняем в метаданных переданный name, либо название самого свойства, если параметр не задан
         */
        Reflect.defineMetadata(ServerNameMetadataKey, name || propertyKey, target, propertyKey);

        /**
         * Создаем уникальный ключ для конструктора при помощи структуры Symbol
         * У класса, родителя, прародителя (и т. д.) они будут разными и уникальными,
         * чтобы в дальнейшем можно было распутать цепочку прототипов и извлечь метаданные каждого из них в отдельности.
         */
        if (!target.constructor.hasOwnProperty(HashPropertyKey)) {
            Reflect.defineProperty(target.constructor, HashPropertyKey, { value: Symbol(target.constructor.name) });
        }
        // получаем ключ конструктора
        let hash = getHash(target.constructor);
        /**
         * Проверяем, не определены ли уже availableFields другим экземпляром декоратора
         */
        let availableFields = Reflect.getMetadata(AvailableFieldsMetadataKey, target, hash);
        if (!availableFields) {
            availableFields = [];

            /**
             * Не передаем 4-й параметр(propertyKey) в defineMetadata, т.к. метаданные общие для всех полей
             */
            Reflect.defineMetadata(AvailableFieldsMetadataKey, availableFields, target, hash);
        }
        /**
         * Регистрируем текущее поле в метаданных
         */
        let field: FieldProperty;
        const propType = Reflect.getMetadata('design:type', target, propertyKey);        

        /**
         * Проверяем передан ли класс конвертера значения.
         */
        if (customConverter && typeof customConverter === 'function') {
            const converter = new customConverter() as JsTsCustomConvert<any>;
            /**
             * Проверяем, что он реализует интерфейс кастомного конвертера
             */
            if (typeof converter.serialize === 'function' && typeof converter.deserialize === 'function') {
                field = new FieldProperty(propertyKey, undefined, converter);
            } else {
                field = new FieldProperty(propertyKey, customConverter);
            }
        } else {
            if (propType === Array) {
                field = new FieldProperty(propertyKey, customConverter ? (customConverter[0] ? customConverter[0] : undefined) : undefined);
            } else {
                field = new FieldProperty(propertyKey);
            }
        }

        if (field) {
            availableFields.push(field);
        }
    };
}

/**
 * Декоратор для сериализации только декорированных свойств
 */
export function SerializeOnlyDecorated() {
    return (target: Object) => {
        /**
         * Отправляем в метаданные флаг о том, что сериализации в контексте класса подвергаются только декарированные свойства
         */
        Reflect.defineMetadata(IgnoreUndecoratedPropertyKey, true, target);
    };
}

/**
 * Декоратор для сериализации Null значений как есть, иначе он превращается в undefined
 */
export function DeserializeNullValueDecorated() {
    return (target: Object) => {
        /**
         * Отправляем в метаданные флаг о том, что сериализации в контексте класса подвергаются только декарированные свойства
         */
        Reflect.defineMetadata(DeserializeNullValue, true, target);
    };
}

/**
 * Извлекает значение уникального свойства типа по ключу { HashPropertyKey }
 */
export function getHash(entity: any) {
    return Reflect.get(entity, HashPropertyKey);
}

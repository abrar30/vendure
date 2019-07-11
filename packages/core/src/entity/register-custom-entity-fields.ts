import { CustomFieldType } from '@vendure/common/lib/shared-types';
import { assertNever } from '@vendure/common/lib/shared-utils';
import { Column, ColumnType, ConnectionOptions } from 'typeorm';

import { CustomFields } from '../config/custom-field/custom-field-types';
import { VendureConfig } from '../config/vendure-config';

import {
    CustomAddressFields,
    CustomCollectionFields,
    CustomCollectionFieldsTranslation,
    CustomCustomerFields,
    CustomFacetFields,
    CustomFacetFieldsTranslation,
    CustomFacetValueFields,
    CustomFacetValueFieldsTranslation,
    CustomGlobalSettingsFields,
    CustomOrderLineFields,
    CustomProductFields,
    CustomProductFieldsTranslation,
    CustomProductOptionFields,
    CustomProductOptionFieldsTranslation,
    CustomProductOptionGroupFields,
    CustomProductOptionGroupFieldsTranslation,
    CustomProductVariantFields,
    CustomProductVariantFieldsTranslation,
    CustomUserFields,
} from './custom-entity-fields';

/**
 * Dynamically add columns to the custom field entity based on the CustomFields config.
 */
function registerCustomFieldsForEntity(
    config: VendureConfig,
    entityName: keyof CustomFields,
    // tslint:disable-next-line:callable-types
    ctor: { new (): any },
    translation = false,
) {
    const customFields = config.customFields && config.customFields[entityName];
    const dbEngine = config.dbConnectionOptions.type;
    if (customFields) {
        for (const customField of customFields) {
            const { name, type } = customField;
            const registerColumn = () =>
                Column({ type: getColumnType(dbEngine, type), name, nullable: true })(new ctor(), name);

            if (translation) {
                if (type === 'localeString') {
                    registerColumn();
                }
            } else {
                if (type !== 'localeString') {
                    registerColumn();
                }
            }
        }
    }
}

function getColumnType(dbEngine: ConnectionOptions['type'], type: CustomFieldType): ColumnType {
    switch (type) {
        case 'string':
        case 'localeString':
            return 'varchar';
        case 'boolean':
            return dbEngine === 'mysql' ? 'tinyint' : 'bool';
        case 'int':
            return 'int';
        case 'float':
            return 'double';
        case 'datetime':
            return dbEngine === 'mysql' ? 'datetime' : 'timestamp';
        default:
            assertNever(type);
    }
    return 'varchar';
}

/**
 * Dynamically registers any custom fields with TypeORM. This function should be run at the bootstrap
 * stage of the app lifecycle, before the AppModule is initialized.
 */
export function registerCustomEntityFields(config: VendureConfig) {
    registerCustomFieldsForEntity(config, 'Address', CustomAddressFields);
    registerCustomFieldsForEntity(config, 'Collection', CustomCollectionFields);
    registerCustomFieldsForEntity(config, 'Collection', CustomCollectionFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'Customer', CustomCustomerFields);
    registerCustomFieldsForEntity(config, 'Facet', CustomFacetFields);
    registerCustomFieldsForEntity(config, 'Facet', CustomFacetFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'FacetValue', CustomFacetValueFields);
    registerCustomFieldsForEntity(config, 'FacetValue', CustomFacetValueFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'OrderLine', CustomOrderLineFields);
    registerCustomFieldsForEntity(config, 'Product', CustomProductFields);
    registerCustomFieldsForEntity(config, 'Product', CustomProductFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'ProductOption', CustomProductOptionFields);
    registerCustomFieldsForEntity(config, 'ProductOption', CustomProductOptionFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'ProductOptionGroup', CustomProductOptionGroupFields);
    registerCustomFieldsForEntity(
        config,
        'ProductOptionGroup',
        CustomProductOptionGroupFieldsTranslation,
        true,
    );
    registerCustomFieldsForEntity(config, 'ProductVariant', CustomProductVariantFields);
    registerCustomFieldsForEntity(config, 'ProductVariant', CustomProductVariantFieldsTranslation, true);
    registerCustomFieldsForEntity(config, 'User', CustomUserFields);
    registerCustomFieldsForEntity(config, 'GlobalSettings', CustomGlobalSettingsFields);
}

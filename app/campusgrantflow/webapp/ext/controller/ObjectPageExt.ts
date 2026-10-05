import ControllerExtension from 'sap/ui/core/mvc/ControllerExtension';
import ExtensionAPI from 'sap/fe/core/ExtensionAPI';
import Context from 'sap/ui/model/odata/v4/Context';

/**
 * @namespace grants.campusgrantflow.ext.controller
 */
export default class ObjectPageExt extends ControllerExtension {
    public static applyForGrant(this: ExtensionAPI, bindingContext: Context): void {
        this.getRouting().navigateToRoute("GrantApplication", { grantId: bindingContext.getProperty("ID") });
    }
}
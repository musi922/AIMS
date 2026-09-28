import ControllerExtension from 'sap/ui/core/mvc/ControllerExtension';
import MessageToast from 'sap/m/MessageToast';
import ExtensionAPI from 'sap/fe/core/ExtensionAPI';
import Context from 'sap/ui/model/odata/v4/Context';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';

export default class ObjectPageExt extends ControllerExtension {
    public static applyForGrant(this: ExtensionAPI, bindingContext: Context): void {
        const getText = (i18nKey: string): string => {
            const model = this.getModel("i18n") as ResourceModel;
            const bundle = model?.getResourceBundle() as ResourceBundle;
            return bundle?.getText(i18nKey) || i18nKey;
        };

        const key = bindingContext.getPath().match(/\((.*?)\)/)?.[1];
        if (!key) {
            MessageToast.show(getText("WizContextMissing"));
            return;
        }

        const routing = (this as unknown as { getRouting: () => { navigateToRoute: Function } }).getRouting();
        if (routing?.navigateToRoute) {
            routing.navigateToRoute("ApplicationWizard", { key });
        }
    }
}

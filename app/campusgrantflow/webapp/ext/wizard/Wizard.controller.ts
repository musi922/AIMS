import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import Wizard from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import ODataRoute from "sap/ui/core/routing/Route";
import Event from "sap/ui/base/Event";

/**
 * @namespace grants.campusgrantflow.ext.wizard
 */
export default class WizardController extends Controller {
    public onInit(): void {
        const route = UIComponent.getRouterFor(this).getRoute("ApplicationWizard") as ODataRoute;
        route?.attachPatternMatched(this.onRouteMatched, this);
    }

    private onRouteMatched(event: Event): void {
        const parameters = event.getParameters() as { arguments: { key: string } };
        const args = parameters.arguments;
        this.getView()?.bindElement(`/GrantsMasterData(${args.key})`);

        const wizard = this.byId("applicationWizard") as Wizard;
        if (wizard && this.byId("step2")) {
            wizard.discardProgress(wizard.getSteps()[0] as WizardStep, false);
            wizard.nextStep();
        }
    }
}

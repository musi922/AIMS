import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import UIComponent from "sap/ui/core/UIComponent";
import Element from "sap/ui/core/Element";
import Wizard, { Wizard$NavigationChangeEvent } from "sap/m/Wizard";
import WizardStep from "sap/m/WizardStep";
import IconTabBar, { IconTabBar$SelectEvent } from "sap/m/IconTabBar";
import IconTabFilter from "sap/m/IconTabFilter";
import Button from "sap/m/Button";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Context from "sap/ui/model/odata/v4/Context";
import CostPlanStep from "./step/CostPlanStep";
import ProjectInformationStep from "./step/ProjectInformationStep";

/**
 * @namespace grants.campusgrantflow.ext.wizard
 */
export default class GrantApplicationWizard extends Controller {
    private static readonly UPDATE_GROUP_ID = "wizardSave";
    private static readonly FIRST_FINANCE_SECTION = "material";

    private view!: View;
    private projectInformationStep!: ProjectInformationStep;
    private costPlanStep!: CostPlanStep;
    private stepsAttached!: Promise<unknown>;
    private saving = false;

    public onInit(): void {
        this.view = this.getView() as View;
        this.projectInformationStep = new ProjectInformationStep(this.view, (key) => this.getText(key));
        this.costPlanStep = new CostPlanStep(this.view, GrantApplicationWizard.UPDATE_GROUP_ID);
        this.stepsAttached = Promise.all([
            this.projectInformationStep.attachTo(this.byId("idProjectInformationWizardStep") as WizardStep),
            this.costPlanStep.attachTo(this.byId("idFinanceMaterialTab") as IconTabFilter)
        ]);

        UIComponent.getRouterFor(this).getRoute("GrantApplication")?.attachPatternMatched(this.onRouteMatched, this);
    }

    public onBackPress(): void {
        const wizard = this.getWizard();
        const steps = wizard.getSteps();
        const currentStep = wizard.getProgressStep();

        if (currentStep !== this.byId("idCostPlanWizardStep") || !this.shiftFinanceSection(-1)) {
            this.rewindTo(steps[steps.indexOf(currentStep) - 1]);
        }
    }

    public onNavigationChange(event: Wizard$NavigationChangeEvent): void {
        this.rewindTo(event.getParameter("step") as WizardStep);
    }

    public onFinanceSectionSelect(event: IconTabBar$SelectEvent): void {
        this.syncFooter(this.getWizard().getProgressStep(), event.getParameter("item") as IconTabFilter);
    }

    public async onSaveDraftPress(): Promise<void> {
        if (await this.saveApplication()) {
            MessageToast.show(this.getText("WizDraftSaved"));
        }
    }

    public async onNextPress(): Promise<void> {
        const wizard = this.getWizard();
        const steps = wizard.getSteps();
        const currentStep = wizard.getProgressStep();

        if (!this.validateStep(currentStep) || !(await this.saveApplication())) {
            return;
        }

        if (currentStep === this.byId("idCostPlanWizardStep") && this.shiftFinanceSection(1)) {
            return;
        }

        const nextStep = steps[steps.indexOf(currentStep) + 1];

        wizard.nextStep();
        if (nextStep === this.byId("idCostPlanWizardStep")) {
            this.getFinanceTabBar().setSelectedKey(GrantApplicationWizard.FIRST_FINANCE_SECTION);
            this.costPlanStep.refresh();
        }
        this.syncFooter(nextStep);
    }

    private async onRouteMatched(event: Route$PatternMatchedEvent): Promise<void> {
        const { grantId } = event.getParameter("arguments") as { grantId: string };

        await this.stepsAttached;
        this.getModel().resetChanges(GrantApplicationWizard.UPDATE_GROUP_ID);
        this.restartWizard();

        const application = await this.requestApplication(grantId);

        this.view.setBindingContext(application);
        await this.costPlanStep.open(grantId, application);
    }

    private async requestApplication(grantId: string): Promise<Context> {
        const binding = this.getModel().bindList("/GrantApplications", undefined, [], [
            new Filter("parentGrant_ID", FilterOperator.EQ, grantId),
            new Filter("IsActiveEntity", FilterOperator.EQ, false)
        ], { $$updateGroupId: GrantApplicationWizard.UPDATE_GROUP_ID });
        const [draft] = await binding.requestContexts(0, 1);

        return draft ?? binding.create({ parentGrant_ID: grantId }, undefined, undefined, true);
    }

    private validateStep(step: WizardStep): boolean {
        if (step === this.byId("idProjectInformationWizardStep")) {
            return this.projectInformationStep.validate();
        }

        const errorKey = step === this.byId("idCostPlanWizardStep") ? this.costPlanStep.validate() : null;

        if (errorKey) {
            MessageBox.error(this.getText(errorKey));
        }

        return !errorKey;
    }

    private async saveApplication(): Promise<boolean> {
        if (this.saving) {
            return false;
        }

        this.saving = true;
        const model = this.getModel();

        try {
            const costChanges = this.costPlanStep.stageChanges();

            await Promise.all([model.submitBatch(GrantApplicationWizard.UPDATE_GROUP_ID), ...costChanges]);
        } catch (error) {
            MessageBox.error((error as Error).message);
            return false;
        } finally {
            this.saving = false;
        }

        if (model.hasPendingChanges(GrantApplicationWizard.UPDATE_GROUP_ID)) {
            MessageBox.error(this.getText("WizSaveError"));
            return false;
        }

        this.costPlanStep.acceptChanges();
        return true;
    }

    private restartWizard(): void {
        const wizard = this.getWizard();
        const steps = wizard.getSteps();

        this.getFinanceTabBar().setSelectedKey(GrantApplicationWizard.FIRST_FINANCE_SECTION);
        wizard.discardProgress(steps[0], false);
        wizard.nextStep();
        this.syncFooter(steps[1]);
    }

    private rewindTo(step: WizardStep): void {
        this.getWizard().discardProgress(step, false);
        this.syncFooter(step);
    }

    private shiftFinanceSection(offset: number): boolean {
        const tabBar = this.getFinanceTabBar();
        const keys = tabBar.getItems().map((item) => (item as IconTabFilter).getKey());
        const key = keys[keys.indexOf(tabBar.getSelectedKey()) + offset];

        if (key) {
            tabBar.setSelectedKey(key);
            this.syncFooter(this.getWizard().getProgressStep());
        }

        return Boolean(key);
    }

    private syncFooter(step: WizardStep, section: Element = this.getFinanceSection()): void {
        const source = step === this.byId("idCostPlanWizardStep") ? section : step;

        (this.byId("idBackButton") as Button).setVisible(step !== this.getWizard().getSteps()[0]);
        (this.byId("idNextButton") as Button).setText(source.data("nextText") ?? this.getText("BtnNext"));
    }

    private getFinanceSection(): IconTabFilter {
        const tabBar = this.getFinanceTabBar();

        return tabBar.getItems().find((item) => (item as IconTabFilter).getKey() === tabBar.getSelectedKey()) as IconTabFilter;
    }

    private getFinanceTabBar(): IconTabBar {
        return this.byId("idFinanceTabBar") as IconTabBar;
    }

    private getWizard(): Wizard {
        return this.byId("idGrantApplicationWizard") as Wizard;
    }

    private getModel(): ODataModel {
        return this.view.getModel() as ODataModel;
    }

    private getText(key: string): string {
        const resourceModel = this.getView()?.getModel("i18n") as ResourceModel;
        return (resourceModel.getResourceBundle() as ResourceBundle).getText(key) ?? key;
    }
}
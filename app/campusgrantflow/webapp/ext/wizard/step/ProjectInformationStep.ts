import InputBase from "sap/m/InputBase";
import MessageBox from "sap/m/MessageBox";
import Select from "sap/m/Select";
import WizardStep from "sap/m/WizardStep";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import { ValueState } from "sap/ui/core/library";
import Context from "sap/ui/model/odata/v4/Context";

type Field = InputBase | Select;

const REQUIRED_FIELDS = ["projectTitle", "projectManager", "department_code", "startDate", "endDate", "description"];
const FIELD_TYPES = ["sap.m.InputBase", "sap.m.Select"];

const calculateDurationYears = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = end.getUTCFullYear() - start.getUTCFullYear();

    start.setUTCFullYear(start.getUTCFullYear() + years);

    return start < end ? years + 1 : years;
};

export default class ProjectInformationStep {
    private readonly fields = new Map<string, Field>();

    constructor(private readonly view: View, private readonly getText: (key: string) => string) {}

    public async attachTo(wizardStep: WizardStep): Promise<void> {
        const content = await Fragment.load({
            id: this.view.getId(),
            name: "grants.campusgrantflow.ext.wizard.fragment.ProjectInformation",
            controller: this
        }) as Control;

        this.registerFields(content);
        wizardStep.addContent(content);
    }

    public validate(): boolean {
        const application = this.getApplication();
        const errors = new Map<string, string>();

        this.fields.forEach((_, property) => this.clearError(property));

        REQUIRED_FIELDS
            .filter((property) => !application.getProperty(property))
            .forEach((property) => errors.set(property, "WizRequiredFieldsMissing"));

        if (!errors.has("startDate") && !errors.has("endDate") && application.getProperty("endDate") <= application.getProperty("startDate")) {
            errors.set("endDate", "WizEndBeforeStart");
        }

        const properties = [...errors.keys()];

        errors.forEach((textKey, property) => this.showError(property, textKey));
        this.fields.get(properties[0])?.focus();

        if (properties.some((property) => !this.fields.has(property))) {
            MessageBox.error(this.getText("WizRequiredFieldsMissing"));
        }

        return errors.size === 0;
    }

    public onDatePickerChange(): void {
        const application = this.getApplication();
        const durationYears = calculateDurationYears(application.getProperty("startDate"), application.getProperty("endDate"));

        this.clearError("endDate");
        application.setProperty("durationYears", durationYears > 0 ? durationYears : null);
    }

    private registerFields(content: Control): void {
        content.findAggregatedObjects(true, (object) => object.isA(FIELD_TYPES)).forEach((object) => {
            const field = object as Field;
            const property = field.getBindingPath("value") ?? field.getBindingPath("selectedKey");

            if (property) {
                this.fields.set(property, field);
                field.attachEvent("change", () => this.clearError(property));
            }
        });
    }

    private showError(property: string, textKey: string): void {
        const field = this.fields.get(property);

        field?.setValueState(ValueState.Error);
        field?.setValueStateText(this.getText(textKey));
    }

    private clearError(property: string): void {
        this.fields.get(property)?.setValueState(ValueState.None);
    }

    private getApplication(): Context {
        return this.view.getBindingContext() as Context;
    }
}
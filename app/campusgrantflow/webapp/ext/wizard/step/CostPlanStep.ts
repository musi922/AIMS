import formatMessage from "sap/base/strings/formatMessage";
import Button, { Button$PressEvent } from "sap/m/Button";
import Column from "sap/m/Column";
import ColumnListItem from "sap/m/ColumnListItem";
import IconTabFilter from "sap/m/IconTabFilter";
import Input from "sap/m/Input";
import Select from "sap/m/Select";
import Table from "sap/m/Table";
import Text from "sap/m/Text";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import Item from "sap/ui/core/Item";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import View from "sap/ui/core/mvc/View";
import BaseContext from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Float from "sap/ui/model/type/Float";
import Formatter from "../formatter/Formatter";

type Summary = "material" | "personnel" | "overhead";
type Kind = "cost" | Summary;
type Row = { kind: Kind; costType: string | null; amounts: (number | null)[]; ownFundsPercentage: number | null; total: number };
type Plan = { overheadPercentage: number; durationYears: number; rows: Row[] };
type Grant = { overheadPercentage: string; currency_code: string; scope: { typeIncome: string | null; typeOutcome: string | null }[] };
type Cost = { costType: string; ownFundsPercentage: string | null; years: { amount: string | null }[] };
type FloatOptions = ConstructorParameters<typeof Float>[0];

const EMPTY_CELL = "—";
const SUMMARIES: Summary[] = ["material", "personnel", "overhead"];
const LABELS: Record<Summary, string> = { material: "CostSumMaterial", personnel: "CostPersonnelRow", overhead: "CostOverheadRow" };
const AMOUNT_FORMAT = { minFractionDigits: 0, maxFractionDigits: 2, groupingEnabled: true } as FloatOptions;
const PERCENT_FORMAT = { maxFractionDigits: 2 } as FloatOptions;
const YEAR_COLUMN_REM = 6;
const FIXED_COLUMNS_REM = 33;
const MAX_FIT_YEARS = 6;
const percentFormat = NumberFormat.getFloatInstance(PERCENT_FORMAT);

const sum = (amounts: (number | null)[]): number => amounts.reduce<number>((total, amount) => total + (amount ?? 0), 0);
const round = (amount: number): number => Math.round(amount * 100) / 100;
const readDurationYears = (application: Context): number => (application.getProperty("durationYears") as number | null) ?? 0;
const newRow = (kind: Kind, years = 0): Row => ({ kind, costType: null, amounts: new Array<number | null>(years).fill(null), ownFundsPercentage: null, total: 0 });
const withSummaries = (costRows: Row[]): Row[] => [...costRows, ...SUMMARIES.map((kind) => newRow(kind))];

export default class CostPlanStep {
    private readonly plan = new JSONModel({
        currency: "",
        overheadPercentage: 0,
        durationYears: 0,
        costTypes: [],
        rows: withSummaries([]),
        budget: { material: [], overhead: [], materialTotal: 0, overheadTotal: 0, personnelTotal: 0, total: 0 }
    });
    private table!: Table;
    private binding?: ODataListBinding;
    private yearColumns: Column[] = [];
    private renderedYears = -1;
    private dirty = false;

    constructor(private readonly view: View, private readonly updateGroupId: string) {}

    public async attachTo(section: IconTabFilter): Promise<void> {
        const content = await Fragment.load({
            id: this.view.getId(),
            name: "grants.campusgrantflow.ext.wizard.fragment.CostPlan",
            controller: this
        }) as Control;

        content.setModel(this.plan, "plan");
        section.addContent(content);
        this.table = this.view.byId("idCostTable") as Table;
    }

    public async open(grantId: string, application: Context): Promise<void> {
        this.dirty = false;
        await Promise.all([this.loadGrant(grantId), this.loadCosts(application)]);
        this.plan.setProperty("/durationYears", readDurationYears(application));
    }

    public refresh(): void {
        const durationYears = readDurationYears(this.view.getBindingContext() as Context);

        if (durationYears !== this.getPlan().durationYears) {
            this.dirty = true;
            this.plan.setProperty("/durationYears", durationYears);
        }

        this.setCostRows(this.getCostRows().map((row) => ({
            ...row,
            amounts: Array.from({ length: durationYears }, (_, index) => row.amounts[index] ?? null)
        })));

        if (durationYears !== this.renderedYears) {
            this.rebuildTable(durationYears);
        }
        this.recalculate();
    }

    public validate(): string | null {
        return this.getCostRows().some(({ costType }) => !costType) ? "WizCostTypeMissing" : null;
    }

    public stageChanges(): Promise<void>[] {
        if (!this.dirty || !this.binding) {
            return [];
        }

        const binding = this.binding;
        const deletions = binding.getAllCurrentContexts()
            .filter((context) => !context.isDeleted())
            .map((context) => context.delete(this.updateGroupId));
        const creations = this.getCostRows().map(({ costType, amounts, ownFundsPercentage }) => binding.create({
            costType,
            ownFundsPercentage: Formatter.toDecimal(ownFundsPercentage),
            years: amounts.map((amount, index) => ({ yearNumber: index + 1, amount: Formatter.toDecimal(amount) }))
        }, true).created() as Promise<void>);

        return [...deletions, ...creations];
    }

    public acceptChanges(): void {
        this.dirty = false;
    }

    public onAddRowPress(): void {
        this.setCostRows([...this.getCostRows(), newRow("cost", this.getPlan().durationYears)]);
        this.onCostChange();
    }

    private onRowDelete(event: Button$PressEvent): void {
        const row = (event.getSource() as Button).getBindingContext("plan")?.getObject();

        this.setCostRows(this.getCostRows().filter((candidate) => candidate !== row));
        this.onCostChange();
    }

    private onCostChange(): void {
        this.dirty = true;
        this.recalculate();
    }

    private async loadGrant(grantId: string): Promise<void> {
        const grant = await this.getModel().bindContext(`/GrantsMasterData(ID=${grantId},IsActiveEntity=true)`, undefined, {
            $select: "overheadPercentage,currency_code",
            $expand: { scope: { $select: "typeIncome,typeOutcome" } }
        }).requestObject() as Grant;
        const names = grant.scope.flatMap(({ typeIncome, typeOutcome }) => [typeIncome, typeOutcome]).filter(Boolean);

        this.plan.setProperty("/currency", grant.currency_code);
        this.plan.setProperty("/overheadPercentage", Number(grant.overheadPercentage));
        this.plan.setProperty("/costTypes", [...new Set(names)].map((name) => ({ name })));
    }

    private async loadCosts(application: Context): Promise<void> {
        this.binding = this.getModel().bindList("costs", application, [], [], {
            $$updateGroupId: this.updateGroupId,
            $$ownRequest: true,
            $expand: { years: { $select: "amount", $orderby: "yearNumber" } }
        });

        const contexts = await this.binding.requestContexts();

        this.setCostRows(contexts.map((context): Row => {
            const { costType, ownFundsPercentage, years } = context.getObject() as Cost;

            return {
                ...newRow("cost"),
                costType,
                ownFundsPercentage: Formatter.toNumber(ownFundsPercentage),
                amounts: years.map(({ amount }) => Formatter.toNumber(amount))
            };
        }));
    }

    private recalculate(): void {
        const { durationYears, overheadPercentage } = this.getPlan();
        const costRows = this.getCostRows();
        const material = Array.from({ length: durationYears }, (_, year) => round(sum(costRows.map(({ amounts }) => amounts[year]))));
        const overhead = material.map((amount) => round(amount * overheadPercentage / 100));
        const materialTotal = round(sum(material));
        const overheadTotal = round(sum(overhead));

        costRows.forEach((row, index) => this.plan.setProperty(`/rows/${index}/total`, round(sum(row.amounts))));
        this.plan.setProperty("/budget", {
            material,
            overhead,
            materialTotal,
            overheadTotal,
            personnelTotal: 0,
            total: round(materialTotal + overheadTotal)
        });
    }

    private rebuildTable(durationYears: number): void {
        this.table.unbindItems();
        this.yearColumns.forEach((column) => column.destroy());
        this.yearColumns = Array.from({ length: durationYears }, (_, index) => {
            const id = this.view.createId(`idCostYear${index + 1}Column`);

            return new Column(id, {
                hAlign: "End",
                width: `${YEAR_COLUMN_REM}rem`,
                header: new Text(`${id}-header`, { text: `{i18n>CostYear} ${index + 1}` })
            });
        });
        this.yearColumns.forEach((column, index) => this.table.insertColumn(column, index + 1));
        this.renderedYears = durationYears;
        this.table.setWidth(durationYears > MAX_FIT_YEARS ? `${FIXED_COLUMNS_REM + durationYears * YEAR_COLUMN_REM}rem` : "100%");

        this.table.bindItems({
            path: "plan>/rows",
            factory: (id: string, context: BaseContext) => {
                const kind = context.getProperty("kind") as Kind;

                return kind === "cost" ? this.createCostItem(id) : this.createSummaryItem(id, kind);
            }
        });
    }

    private createCostItem(id: string): ColumnListItem {
        const change = () => this.onCostChange();

        return new ColumnListItem(id, {
            cells: [
                new Select(`${id}-type`, {
                    width: "100%",
                    forceSelection: false,
                    selectedKey: "{plan>costType}",
                    items: {
                        path: "plan>/costTypes",
                        template: new Item(`${id}-typeItem`, { key: "{plan>name}", text: "{plan>name}" }),
                        templateShareable: false
                    },
                    change
                }),
                ...Array.from({ length: this.renderedYears }, (_, index) => new Input(`${id}-year${index + 1}`, {
                    value: { path: `plan>amounts/${index}`, type: new Float(AMOUNT_FORMAT, { minimum: 0 }) },
                    textAlign: "End",
                    change
                })),
                new Text(`${id}-total`, { text: this.amountBinding("total") }),
                new Input(`${id}-ownFunds`, {
                    value: { path: "plan>ownFundsPercentage", type: new Float(PERCENT_FORMAT, { minimum: 0, maximum: 100 }) },
                    textAlign: "End",
                    description: "%",
                    fieldWidth: "80%",
                    change
                }),
                new Button(`${id}-delete`, {
                    icon: "sap-icon://decline",
                    type: "Transparent",
                    tooltip: "{i18n>CostDeleteRow}",
                    press: (event: Button$PressEvent) => this.onRowDelete(event)
                })
            ]
        });
    }

    private createSummaryItem(id: string, kind: Summary): ColumnListItem {
        const cell = (name: string, text: string | PropertyBindingInfo) => new Text(`${id}-${name}`, { text });
        const amount = (path: string) => kind === "personnel" ? EMPTY_CELL : this.amountBinding(path);

        return new ColumnListItem(id, {
            cells: [
                cell("label", {
                    parts: [{ model: "i18n", path: LABELS[kind] }, { model: "plan", path: "/overheadPercentage" }],
                    formatter: (pattern: string, percentage: number) => formatMessage(pattern, [percentFormat.format(percentage)])
                }),
                ...Array.from({ length: this.renderedYears }, (_, index) => cell(`year${index + 1}`, amount(`/budget/${kind}/${index}`))),
                cell("total", amount(`/budget/${kind}Total`)),
                cell("ownFunds", EMPTY_CELL),
                cell("action", "")
            ]
        });
    }

    private amountBinding(path: string): PropertyBindingInfo {
        return {
            parts: [{ model: "plan", path }, { model: "plan", path: "/currency" }],
            formatter: Formatter.currency
        };
    }

    private getCostRows(): Row[] {
        return this.getPlan().rows.filter(({ kind }) => kind === "cost");
    }

    private setCostRows(costRows: Row[]): void {
        this.plan.setProperty("/rows", withSummaries(costRows));
    }

    private getPlan(): Plan {
        return this.plan.getData() as Plan;
    }

    private getModel(): ODataModel {
        return this.view.getModel() as ODataModel;
    }
}
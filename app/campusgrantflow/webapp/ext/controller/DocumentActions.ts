import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import type Button from 'sap/m/Button';
import MessageBox from 'sap/m/MessageBox';
import type UI5Event from 'sap/ui/base/Event';
import type Context from 'sap/ui/model/odata/v4/Context';
import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';

export async function upload(context: Context): Promise<void> {
    const input = document.createElement('input');
    input.type = 'file';
    const file = await new Promise<File | undefined>((resolve) => {
        input.addEventListener('change', () => resolve(input.files?.[0]), { once: true });
        input.addEventListener('cancel', () => resolve(undefined), { once: true });
        input.click();
    });
    if (!file) {
        return;
    }

    const bundle = await ResourceBundle.create({ bundleName: 'grants.campusgrantflow.i18n.i18n', async: true });
    const getText = (key: string, ...args: string[]): string => bundle.getText(key, args) || key;

    const serviceUrl = (context.getModel() as ODataModel).getServiceUrl();
    const documentsUrl = `${serviceUrl}${context.getPath().slice(1)}/documents`;
    const token = (await fetch(serviceUrl, { headers: { 'X-CSRF-Token': 'Fetch' }, method: 'HEAD' })).headers.get('X-CSRF-Token');

    const call = async (method: string, url: string, contentType?: string, body?: BodyInit): Promise<Response> => {
        const headers: Record<string, string> = {};
        if (token) {
            headers['X-CSRF-Token'] = token;
        }
        if (contentType) {
            headers['Content-Type'] = contentType;
        }
        const response = await fetch(url, { body, headers, method });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response;
    };

    const mediaType = file.type || 'application/octet-stream';
    try {
        const created = await call('POST', documentsUrl, 'application/json', JSON.stringify({ fileName: file.name, mediaType }));
        const documentUrl = `${documentsUrl}(ID=${((await created.json()) as { ID: string }).ID},IsActiveEntity=false)`;
        try {
            await call('PUT', `${documentUrl}/document`, mediaType, file);
        } catch (error) {
            await call('DELETE', documentUrl);
            throw error;
        }
        await context.requestSideEffects([{ $NavigationPropertyPath: 'documents' }]);
    } catch {
        MessageBox.error(getText('uploadFailed', file.name));
    }
}

export function download(event: UI5Event): void {
    const context = (event.getSource() as Button).getBindingContext() as Context;
    const link = document.createElement('a');
    link.href = `${(context.getModel() as ODataModel).getServiceUrl()}${context.getPath().slice(1)}/document`;
    link.download = '';
    link.click();
}
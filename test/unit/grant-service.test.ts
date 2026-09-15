import { describe, expect, it } from '@jest/globals';

import * as serviceHandler from '../../srv/grant-service';

const GrantMasterDataService = serviceHandler as unknown as { default: unknown };

describe('GrantMasterDataService', () => {
    it('should expose a handler class with an init method', () => {
        expect(GrantMasterDataService).toBeDefined();
        const proto = (GrantMasterDataService as unknown as { prototype?: { init?: unknown } }).prototype;
        expect(typeof proto?.init).toBe('function');
    });
});

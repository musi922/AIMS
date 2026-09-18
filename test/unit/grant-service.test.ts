import { describe, expect, it } from '@jest/globals';
import { GrantMasterDataService } from '../../srv/grant-service';

describe('GrantMasterDataService', () => {
    it('should expose a handler class with an init method', () => {
        expect(GrantMasterDataService).toBeDefined();
        expect(typeof GrantMasterDataService.prototype.init).toBe('function');
    });
});
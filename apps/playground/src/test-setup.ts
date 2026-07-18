import '@analogjs/vitest-angular/setup-zone';

import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

// Mismo criterio que packages/components/src/test-setup.ts: setupTestBed()
// tolera workers compartidos (init único + cleanup hooks por archivo).
setupTestBed({ zoneless: false });

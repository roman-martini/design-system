import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';

// Zoneless, igual que la app (`app.config.ts` provee provideZonelessChangeDetection).
// Testear bajo otro modelo de change detection es una fidelidad falsa: un defecto
// propio de zoneless pasaría la suite y fallaría en el navegador (aaa-042).
// setupTestBed() además tolera workers compartidos (init único + cleanup por archivo).
setupTestBed({ zoneless: true });

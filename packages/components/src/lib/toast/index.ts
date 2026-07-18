// API pública del sistema de toasts: la service, el provider y sus types.
// El contenedor y el item son internos (design.md §1 de aaa-021).
export { DsToastService, provideDsToasts } from './toast';
export type {
  DsToastAction,
  DsToastConfig,
  DsToastOptions,
  DsToastPosition,
  DsToastRef,
  DsToastVariant,
} from './toast';

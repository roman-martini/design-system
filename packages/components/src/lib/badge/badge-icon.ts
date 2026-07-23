import { Directive } from '@angular/core';

/**
 * Marca un elemento como ícono leading de `ds-badge`. Lo vuelve decorativo
 * (`aria-hidden`) automáticamente — el significado del badge lo lleva el texto.
 * Directiva liviana: no importa ningún ícono, respeta el tree-shaking de Lucide (ADR-012).
 */
@Directive({
  selector: '[dsBadgeIcon]',
  standalone: true,
  host: {
    'aria-hidden': 'true',
  },
})
export class DsBadgeIcon {}

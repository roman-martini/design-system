import { Directive, ElementRef, inject, input } from '@angular/core';

import { DsMenu } from './menu';

/**
 * Convierte cualquier botón (DsButton, icon button o botón nativo) en el
 * trigger de un ds-menu (decisión 1 de HU-012). La directiva cablea la
 * semántica ARIA del patrón menu button y la apertura por teclado; el
 * light-dismiss y el Esc dentro del panel los maneja el propio menú.
 */
@Directive({
  selector: '[dsMenuTriggerFor]',
  standalone: true,
  host: {
    '[attr.aria-haspopup]': "'menu'",
    '[attr.aria-expanded]': 'menu().isOpen()',
    '[attr.aria-controls]': 'menu().isOpen() ? menu().panelId : null',
    '(pointerdown)': 'onPointerdown()',
    '(click)': 'onClick()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class DsMenuTrigger {
  readonly menu = input.required<DsMenu>({ alias: 'dsMenuTriggerFor' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Mitiga el doble toggle del light-dismiss nativo: un pointerdown sobre el
  // trigger con el popover abierto lo cierra (dismiss) antes de que llegue el
  // click, que sin esta marca lo reabriría (mismo patrón que DsSelect).
  private wasOpenOnPointerdown = false;

  protected onPointerdown(): void {
    this.wasOpenOnPointerdown = this.menu().isOpen();
  }

  protected onClick(): void {
    if (this.wasOpenOnPointerdown) {
      this.wasOpenOnPointerdown = false;
      return;
    }
    if (this.menu().isOpen()) {
      this.menu().close();
    } else {
      this.open();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    // Enter y Space ya disparan click en un botón nativo; acá solo las
    // flechas del patrón APG menu button.
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.open();
    }
  }

  private open(): void {
    this.menu().openFromAnchor(this.host.nativeElement);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

/**
 * Contrato mínimo que DsMenuItem cumple para que DsMenu gestione registro,
 * navegación, typeahead y submenús sin importar DsMenuItem directamente
 * (evita la dependencia circular — mismo patrón que DsOptionRegistration).
 */
export interface DsMenuItemRegistration {
  hostElement(): HTMLElement;
  isDisabled(): boolean;
  labelText(): string;
  hasSubmenu(): boolean;
  closeOwnSubmenu(): void;
}

let nextMenuId = 0;

// Reset del buffer de typeahead. Constante interna (no es un valor visual,
// no va a tokens): es el ritmo de tipeo, no un estilo.
const TYPEAHEAD_RESET_MS = 500;

// Fallback cuando el entorno no resuelve las CSS vars (jsdom en tests).
const DEFAULT_SUBMENU_OFFSET_PX = 4;
const ROOT_GAP_PX = 4;

@Component({
  selector: 'ds-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class DsMenu {
  readonly panelId = `ds-menu-panel-${nextMenuId++}`;

  // El menú padre existe solo cuando este ds-menu está declarado dentro de
  // otro (submenú). Define el modo de posicionamiento (design §4).
  private readonly parentMenu = inject(DsMenu, { optional: true, skipSelf: true });

  private readonly panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');

  private readonly open = signal(false);
  private readonly items = signal<DsMenuItemRegistration[]>([]);

  // Elemento que ancla el panel (trigger raíz o item padre del submenú);
  // también es el destino del foco al cerrar por teclado.
  private anchorEl: HTMLElement | null = null;

  private typeaheadBuffer = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly repositionListener = () => this.position();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.detachRepositionListeners();
      this.clearTypeaheadTimer();
    });
  }

  isOpen(): boolean {
    return this.open();
  }

  isSubmenu(): boolean {
    return this.parentMenu !== null;
  }

  // API que los DsMenuItem hijos consumen
  registerItem(item: DsMenuItemRegistration): void {
    if (!this.items().includes(item)) {
      this.items.update((list) => [...list, item]);
    }
  }

  unregisterItem(item: DsMenuItemRegistration): void {
    this.items.update((list) => list.filter((i) => i !== item));
  }

  /** Abre anclado a `anchor` y enfoca el primer item habilitado. */
  openFromAnchor(anchor: HTMLElement): void {
    if (this.open()) {
      return;
    }
    this.anchorEl = anchor;
    this.open.set(true);
    this.panelRef().nativeElement.showPopover?.();
    this.position();
    window.addEventListener('scroll', this.repositionListener, { capture: true, passive: true });
    window.addEventListener('resize', this.repositionListener, { passive: true });
    this.focusFirst();
  }

  /** Cierra este nivel (y su descendencia). No devuelve el foco. */
  close(): void {
    if (!this.open()) {
      return;
    }
    this.closeOpenSubmenus();
    this.open.set(false);
    this.panelRef().nativeElement.hidePopover?.();
    this.detachRepositionListeners();
    this.resetTypeahead();
  }

  /** Cierra este nivel devolviendo el foco al ancla (Esc / ←). */
  closeAndFocusAnchor(): void {
    const anchor = this.anchorEl;
    this.close();
    anchor?.focus();
  }

  /** Cierra el árbol completo desde la raíz y devuelve el foco al trigger. */
  closeTree(): void {
    if (this.parentMenu) {
      this.parentMenu.closeTree();
    } else {
      this.closeAndFocusAnchor();
    }
  }

  /** Cierra los submenús abiertos de los items de este nivel. */
  closeOpenSubmenus(): void {
    for (const item of this.items()) {
      item.closeOwnSubmenu();
    }
  }

  /** Cierra los submenús de este nivel salvo el del item dado (evita el
   *  flicker de cerrar y reabrir el que ya está abierto al hoverearlo). */
  closeSubmenusExcept(except: DsMenuItemRegistration): void {
    for (const item of this.items()) {
      if (item !== except) {
        item.closeOwnSubmenu();
      }
    }
  }

  // Sincroniza el estado cuando la plataforma cierra el popover por su cuenta
  // (light-dismiss por click fuera o ESC a nivel documento). Regla 1 de
  // ADR-014: el cierre nativo nunca diverge del estado propio.
  protected onPopoverToggle(event: Event): void {
    const newState = (event as Event & { newState?: string }).newState;
    if (newState === 'closed' && this.open()) {
      this.closeOpenSubmenus();
      this.open.set(false);
      this.detachRepositionListeners();
      this.resetTypeahead();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this.focusLast();
        break;
      case 'Escape':
        event.preventDefault();
        // Esc cierra solo este nivel (APG): en un submenú vuelve al item
        // padre; en la raíz, al trigger. stopPropagation evita que el Esc
        // burbujee al nivel de arriba y cierre dos niveles de una.
        event.stopPropagation();
        this.closeAndFocusAnchor();
        break;
      case 'ArrowLeft':
        if (this.isSubmenu()) {
          event.preventDefault();
          event.stopPropagation();
          this.closeAndFocusAnchor();
        }
        break;
      case 'Tab':
        // APG menu button: Tab cierra el menú antes de ceder el foco. Sin
        // preventDefault: el árbol se cierra (foco al trigger) y el Tab
        // nativo sigue al siguiente elemento de la secuencia.
        this.closeTree();
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.typeahead(event.key);
        }
    }
  }

  // La navegación NO saltea items disabled (descubribilidad, ADR-011);
  // la activación sí está bloqueada en el item.
  private moveFocus(delta: 1 | -1): void {
    const items = this.items();
    if (items.length === 0) {
      return;
    }
    const current = this.focusedIndex();
    const next = current === -1 ? 0 : (current + delta + items.length) % items.length;
    items[next].hostElement().focus();
  }

  focusFirst(): void {
    this.items()[0]?.hostElement().focus();
  }

  private focusLast(): void {
    const items = this.items();
    items[items.length - 1]?.hostElement().focus();
  }

  private focusedIndex(): number {
    const active = document.activeElement;
    return this.items().findIndex((item) => item.hostElement() === active);
  }

  private typeahead(char: string): void {
    this.typeaheadBuffer += char.toLowerCase();
    this.clearTypeaheadTimer();
    this.typeaheadTimer = setTimeout(() => this.resetTypeahead(), TYPEAHEAD_RESET_MS);

    const items = this.items();
    const start = Math.max(this.focusedIndex(), 0);
    // Busca desde el item siguiente al enfocado, con wrap; si el buffer tiene
    // una sola letra arranca en el siguiente (saltar entre items con la misma
    // inicial); con buffer más largo incluye el actual (refinar la búsqueda).
    const offset = this.typeaheadBuffer.length === 1 ? 1 : 0;
    for (let step = 0; step < items.length; step++) {
      const index = (start + offset + step) % items.length;
      if (items[index].labelText().toLowerCase().startsWith(this.typeaheadBuffer)) {
        items[index].hostElement().focus();
        return;
      }
    }
  }

  private resetTypeahead(): void {
    this.typeaheadBuffer = '';
    this.clearTypeaheadTimer();
  }

  private clearTypeaheadTimer(): void {
    if (this.typeaheadTimer !== null) {
      clearTimeout(this.typeaheadTimer);
      this.typeaheadTimer = null;
    }
  }

  // Posicionamiento fallback JS extendido (design §4, sobre ADR-014 §2):
  // raíz = debajo del ancla alineado al borde inicial, flip vertical;
  // submenú = lateral al item padre, flip horizontal + clamp vertical.
  // Se migra a CSS anchor positioning cuando Safari 18 salga del target.
  private position(): void {
    const anchor = this.anchorEl;
    if (!anchor) {
      return;
    }
    const panel = this.panelRef().nativeElement;
    const rect = anchor.getBoundingClientRect();
    panel.style.position = 'fixed';

    const panelWidth = panel.offsetWidth;
    const panelHeight = panel.offsetHeight;

    if (this.isSubmenu()) {
      const offset = this.readCssNumber(
        panel,
        '--ds-component-menu-submenu-offset',
        DEFAULT_SUBMENU_OFFSET_PX,
      );
      const fitsRight = rect.right + offset + panelWidth <= window.innerWidth;
      const left = fitsRight ? rect.right + offset : Math.max(0, rect.left - panelWidth - offset);
      // Alineado al tope del item padre; clamp para no desbordar abajo.
      const top = Math.max(0, Math.min(rect.top, window.innerHeight - panelHeight));
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      return;
    }

    const spaceBelow = window.innerHeight - rect.bottom - ROOT_GAP_PX;
    const openUpwards = panelHeight > spaceBelow && rect.top > spaceBelow;
    panel.style.left = `${Math.max(0, Math.min(rect.left, window.innerWidth - panelWidth))}px`;
    panel.style.top = openUpwards
      ? `${Math.max(0, rect.top - panelHeight - ROOT_GAP_PX)}px`
      : `${rect.bottom + ROOT_GAP_PX}px`;
  }

  private readCssNumber(el: HTMLElement, name: string, fallback: number): number {
    const raw = getComputedStyle(el).getPropertyValue(name).trim();
    const parsed = parseFloat(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  private detachRepositionListeners(): void {
    window.removeEventListener('scroll', this.repositionListener, { capture: true });
    window.removeEventListener('resize', this.repositionListener);
  }
}

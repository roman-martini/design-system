import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';

import { DsMenu, type DsMenuItemRegistration } from './menu';

// Fallback cuando el entorno no resuelve las CSS vars (jsdom en tests).
const DEFAULT_SUBMENU_DELAY_MS = 150;

@Component({
  selector: 'ds-menu-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideChevronRight],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.css',
  host: {
    role: 'menuitem',
    tabindex: '-1',
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '[attr.aria-haspopup]': "submenu() ? 'menu' : null",
    '[attr.aria-expanded]': 'submenu() ? submenu()!.isOpen() : null',
    '[class.ds-menu-item--danger]': 'danger()',
    '[class.ds-menu-item--disabled]': 'disabled()',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
    '(mouseenter)': 'onMouseEnter()',
  },
})
export class DsMenuItem implements DsMenuItemRegistration, OnInit, OnDestroy {
  readonly disabled = input<boolean>(false);
  readonly danger = input<boolean>(false);
  /** Panel ds-menu que este item abre como submenú (design §3). */
  readonly submenu = input<DsMenu | undefined>(undefined);

  readonly selected = output<void>();

  private readonly menu = inject(DsMenu);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearHoverTimer());
  }

  ngOnInit(): void {
    this.menu.registerItem(this);
  }

  ngOnDestroy(): void {
    this.menu.unregisterItem(this);
  }

  // DsMenuItemRegistration
  hostElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  isDisabled(): boolean {
    return this.disabled();
  }

  labelText(): string {
    // Lectura del texto proyectado para el typeahead (mismo mecanismo
    // documentado que DsOption.labelText, aaa-016).
    return this.elementRef.nativeElement.textContent?.trim() ?? '';
  }

  hasSubmenu(): boolean {
    return this.submenu() !== undefined;
  }

  closeOwnSubmenu(): void {
    this.submenu()?.close();
  }

  protected onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.activate(true);
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        event.stopPropagation();
        this.activate(true);
        break;
      case 'ArrowRight':
        if (this.hasSubmenu() && !this.disabled()) {
          event.preventDefault();
          event.stopPropagation();
          this.openSubmenu(true);
        }
        break;
    }
  }

  protected onMouseEnter(): void {
    this.clearHoverTimer();
    // Foco sigue al hover (APG menu): mantiene un único punto activo.
    this.hostElement().focus();
    // Hover sobre un item cierra el submenú abierto de un hermano.
    this.closeSiblingSubmenus();
    if (this.hasSubmenu() && !this.disabled() && !this.submenu()!.isOpen()) {
      // Apertura con intención (delay tokenizado, design §3); el foco se
      // queda en el item — entrar al panel es decisión explícita (→/Enter).
      this.hoverTimer = setTimeout(() => this.openSubmenu(false), this.resolveHoverDelay());
    }
  }

  private activate(focusIntoSubmenu: boolean): void {
    if (this.disabled()) {
      // Guarda ADR-011: focusable y descubrible, pero sin acción ni cierre.
      return;
    }
    if (this.hasSubmenu()) {
      this.openSubmenu(focusIntoSubmenu);
      return;
    }
    this.selected.emit();
    this.menu.closeTree();
  }

  private openSubmenu(focusFirst: boolean): void {
    const submenu = this.submenu();
    if (!submenu) {
      return;
    }
    this.closeSiblingSubmenus();
    if (!submenu.isOpen()) {
      submenu.openFromAnchor(this.hostElement());
    }
    if (focusFirst) {
      submenu.focusFirst();
    } else {
      // La apertura por hover no roba el foco del item invocador.
      this.hostElement().focus();
    }
  }

  private closeSiblingSubmenus(): void {
    this.menu.closeSubmenusExcept(this);
  }

  private resolveHoverDelay(): number {
    const raw = getComputedStyle(this.hostElement())
      .getPropertyValue('--ds-component-menu-submenu-delay')
      .trim();
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) {
      return DEFAULT_SUBMENU_DELAY_MS;
    }
    // "0.15s" → 150; "150ms"/"150" → 150
    return raw.endsWith('ms') || !raw.endsWith('s') ? parsed : parsed * 1000;
  }

  private clearHoverTimer(): void {
    if (this.hoverTimer !== null) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }
}

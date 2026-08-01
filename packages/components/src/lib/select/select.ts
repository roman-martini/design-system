import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideChevronDown } from '@lucide/angular';

export type DsSelectSize = 'sm' | 'md' | 'lg';

/**
 * Contrato mínimo que DsOption cumple para que DsSelect gestione registro,
 * navegación y selección sin importar DsOption directamente (evita la
 * dependencia circular — mismo patrón que DsRadioRegistration).
 */
export interface DsOptionRegistration {
  valueProp(): unknown;
  isDisabled(): boolean;
  labelText(): string;
  optionId(): string;
}

let nextSelectId = 0;

// Reset del buffer de typeahead. Constante interna (no es un valor visual,
// no va a tokens): es el ritmo de tipeo, no un estilo. Mismo valor que DsMenu;
// el helper compartido queda para el refactor de overlays (Parte J).
const TYPEAHEAD_RESET_MS = 500;

// Fallback cuando el entorno no resuelve las CSS vars (jsdom en tests).
const DEFAULT_LISTBOX_OFFSET_PX = 4;

@Component({
  selector: 'ds-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideChevronDown],
  templateUrl: './select.html',
  styleUrl: './select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DsSelect),
      multi: true,
    },
  ],
})
export class DsSelect implements ControlValueAccessor {
  readonly value = model<unknown>(null);
  readonly disabled = model<boolean>(false);
  readonly placeholder = input<string>('');
  readonly size = input<DsSelectSize>('md');
  // El role="combobox" vive en el button interno, no en el host: el nombre
  // accesible del consumidor se reenvía al trigger (el alias consume el
  // atributo del host para que no quede duplicado e inerte).
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  protected readonly listboxId = `ds-select-listbox-${nextSelectId++}`;

  protected readonly open = signal(false);
  private readonly activeIndex = signal(-1);
  private readonly options = signal<DsOptionRegistration[]>([]);

  protected readonly hasSelection = computed(() =>
    this.options().some((o) => o.valueProp() === this.value()),
  );

  protected readonly triggerLabel = computed(() => {
    const selected = this.options().find((o) => o.valueProp() === this.value());
    return selected ? selected.labelText() : this.placeholder();
  });

  protected readonly activeDescendant = computed(() => {
    const active = this.options()[this.activeIndex()];
    return this.open() && active ? active.optionId() : null;
  });

  private readonly triggerRef = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly listboxRef = viewChild.required<ElementRef<HTMLElement>>('listbox');

  // Mitiga el doble toggle del light-dismiss nativo: un pointerdown sobre el
  // trigger con el popover abierto lo cierra (dismiss) antes de que llegue el
  // click, que sin esta marca lo reabriría.
  private wasOpenOnPointerdown = false;

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};
  private readonly repositionListener = () => this.position();

  private typeaheadBuffer = '';
  private typeaheadTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.detachRepositionListeners();
      this.clearTypeaheadTimer();
    });
  }

  // ControlValueAccessor
  writeValue(value: unknown): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // API que las DsOption hijas consumen
  registerOption(option: DsOptionRegistration): void {
    if (!this.options().includes(option)) {
      this.options.update((opts) => [...opts, option]);
    }
  }

  unregisterOption(option: DsOptionRegistration): void {
    this.options.update((opts) => opts.filter((o) => o !== option));
  }

  isSelectedValue(value: unknown): boolean {
    return this.value() === value;
  }

  isActiveOption(option: DsOptionRegistration): boolean {
    return this.open() && this.options()[this.activeIndex()] === option;
  }

  selectFromOption(option: DsOptionRegistration): void {
    if (this.disabled() || option.isDisabled()) {
      return;
    }
    this.commitSelection(option);
  }

  // Interacción del trigger
  protected onTriggerPointerdown(): void {
    this.wasOpenOnPointerdown = this.open();
  }

  protected onTriggerClick(): void {
    if (this.disabled()) {
      return;
    }
    if (this.wasOpenOnPointerdown) {
      // El light-dismiss nativo ya lo cerró en el pointerdown de este click.
      this.wasOpenOnPointerdown = false;
      return;
    }
    if (this.open()) {
      this.closeList();
    } else {
      this.openList();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }

    if (!this.open()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        // preventDefault evita el click sintético del button (Enter/Space)
        // y el scroll de página (flechas/Space).
        event.preventDefault();
        this.openList();
      } else if (this.isTypeaheadKey(event)) {
        // APG select-only: tipear con el combobox cerrado abre el listado y
        // posiciona la opción activa en la primera coincidencia, sin cambiar
        // el valor. La búsqueda arranca desde la primera opción (fromStart):
        // el ciclo de iniciales solo tiene sentido con el listado ya abierto.
        this.openList();
        this.typeahead(event.key, true);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        this.setActiveToEdge('first');
        break;
      case 'End':
        event.preventDefault();
        this.setActiveToEdge('last');
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const active = this.options()[this.activeIndex()];
        if (active && !active.isDisabled()) {
          this.commitSelection(active);
        }
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.closeList();
        break;
      default:
        if (this.isTypeaheadKey(event)) {
          this.typeahead(event.key);
        }
    }
  }

  // Marca touched cuando el foco abandona el trigger sin listado abierto.
  // Con el listado abierto el blur solo ocurre dentro de una secuencia de
  // cierre (light-dismiss, Tab-out) cuyo dueño es el propio cierre (design §1).
  protected onTriggerBlur(): void {
    if (!this.open()) {
      this.onTouched();
    }
  }

  // Sincroniza el estado cuando la plataforma cierra el popover por su cuenta
  // (light-dismiss por click fuera o ESC a nivel documento). Marca touched:
  // es un cierre de listado como cualquier otro (paridad con closeList).
  protected onPopoverToggle(event: Event): void {
    const newState = (event as Event & { newState?: string }).newState;
    if (newState === 'closed' && this.open()) {
      this.open.set(false);
      this.detachRepositionListeners();
      this.resetTypeahead();
      this.onTouched();
    }
  }

  private openList(): void {
    const initial = this.options().findIndex((o) => o.valueProp() === this.value());
    this.activeIndex.set(initial >= 0 ? initial : this.firstEnabledIndex());
    this.open.set(true);
    this.listboxRef().nativeElement.showPopover?.();
    this.position();
    window.addEventListener('scroll', this.repositionListener, { capture: true, passive: true });
    window.addEventListener('resize', this.repositionListener, { passive: true });
  }

  private closeList(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.listboxRef().nativeElement.hidePopover?.();
    this.detachRepositionListeners();
    this.resetTypeahead();
    this.onTouched();
  }

  private commitSelection(option: DsOptionRegistration): void {
    this.value.set(option.valueProp());
    this.onChange(option.valueProp());
    this.closeList();
  }

  private moveActive(delta: 1 | -1): void {
    const opts = this.options();
    let i = this.activeIndex();
    for (let step = 0; step < opts.length; step++) {
      i += delta;
      if (i < 0 || i >= opts.length) {
        return; // sin wrap: el patrón combobox APG se detiene en los extremos
      }
      if (!opts[i].isDisabled()) {
        this.activeIndex.set(i);
        return;
      }
    }
  }

  private setActiveToEdge(edge: 'first' | 'last'): void {
    const index = edge === 'first' ? this.firstEnabledIndex() : this.lastEnabledIndex();
    if (index >= 0) {
      this.activeIndex.set(index);
    }
  }

  private firstEnabledIndex(): number {
    return this.options().findIndex((o) => !o.isDisabled());
  }

  private lastEnabledIndex(): number {
    const opts = this.options();
    for (let i = opts.length - 1; i >= 0; i--) {
      if (!opts[i].isDisabled()) return i;
    }
    return -1;
  }

  private isTypeaheadKey(event: KeyboardEvent): boolean {
    // Space queda fuera: cerrado abre el listado y abierto confirma la
    // selección (design §2). Un label con espacios se alcanza por el prefijo.
    return (
      event.key.length === 1 &&
      event.key !== ' ' &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    );
  }

  // Typeahead APG portado de DsMenu, adaptado a aria-activedescendant: mueve
  // la opción activa, nunca el valor. A diferencia del menú saltea disabled,
  // la misma regla que moveActive (una opción disabled no puede ser activa).
  private typeahead(char: string, fromStart = false): void {
    this.typeaheadBuffer += char.toLowerCase();
    this.clearTypeaheadTimer();
    this.typeaheadTimer = setTimeout(() => this.resetTypeahead(), TYPEAHEAD_RESET_MS);

    // Same-letter cycling (APG): "aa" busca como "a" — repetir la inicial
    // cicla entre las opciones que empiezan con ella en vez de no matchear.
    const buffer = this.typeaheadBuffer;
    const query = /^(.)\1*$/.test(buffer) ? buffer[0] : buffer;

    const opts = this.options();
    // Con query de una letra arranca en la siguiente a la activa (ciclar);
    // con query más larga incluye la actual (refinar la búsqueda). En la
    // apertura por tipeo busca desde la primera opción.
    const start = fromStart ? 0 : Math.max(this.activeIndex(), 0);
    const offset = fromStart ? 0 : query.length === 1 ? 1 : 0;
    for (let step = 0; step < opts.length; step++) {
      const index = (start + offset + step) % opts.length;
      const option = opts[index];
      if (!option.isDisabled() && option.labelText().toLowerCase().startsWith(query)) {
        this.activeIndex.set(index);
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

  // Posicionamiento fallback JS (design.md §2): debajo del trigger, al menos
  // tan ancho como él, flip vertical si no hay espacio. Se migra a CSS anchor
  // positioning cuando Safari 18 salga de la ventana de soporte (ADR-014).
  private position(): void {
    const trigger = this.triggerRef().nativeElement;
    const listbox = this.listboxRef().nativeElement;
    const rect = trigger.getBoundingClientRect();
    const gap = this.readCssNumber(
      listbox,
      '--ds-component-select-listbox-offset',
      DEFAULT_LISTBOX_OFFSET_PX,
    );

    listbox.style.position = 'fixed';
    // Piso, no ancho exacto: una opción más larga que el trigger se muestra
    // entera en vez de partirse en varias líneas (el max-width del CSS la
    // acota al viewport). Con `width` el listbox heredaba el ancho de un
    // trigger contraído por su label seleccionado.
    listbox.style.minWidth = `${rect.width}px`;
    // Clamp horizontal: el listbox puede ser más ancho que el trigger, así que
    // se corre a la izquierda antes que salirse por el borde derecho.
    listbox.style.left = `${Math.max(0, Math.min(rect.left, window.innerWidth - listbox.offsetWidth))}px`;

    const listboxHeight = listbox.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const openUpwards = listboxHeight > spaceBelow && rect.top > spaceBelow;

    listbox.style.top = openUpwards
      ? `${Math.max(0, rect.top - listboxHeight - gap)}px`
      : `${rect.bottom + gap}px`;
  }

  private detachRepositionListeners(): void {
    window.removeEventListener('scroll', this.repositionListener, { capture: true });
    window.removeEventListener('resize', this.repositionListener);
  }

  // Copia consciente del readCssNumber de DsMenu (components-11): la util
  // compartida se extrae en el refactor de overlays (Parte J), no acá.
  private readCssNumber(el: HTMLElement, name: string, fallback: number): number {
    const raw = getComputedStyle(el).getPropertyValue(name).trim();
    const parsed = parseFloat(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
}

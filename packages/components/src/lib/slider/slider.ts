import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type DsSliderSize = 'sm' | 'md' | 'lg';

/** Marca opcional sobre el track; `label` solo donde se declara. */
export interface DsSliderTick {
  readonly value: number;
  readonly label?: string;
}

let nextSliderId = 0;

/**
 * Slider híbrido (design §1 de aaa-044): el `<input type="range">` invisible es
 * el motor —semántica, teclado, arrastre y forms nativos— y la capa visual son
 * elementos propios sincronizados por la custom property `--ds-slider-pct`.
 * Control autónomo tipado a `number` (patrón DsSwitch), no extiende DsFieldBase
 * (excepción prevista por ADR-020, justificada en design §2).
 */
@Component({
  selector: 'ds-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slider.html',
  styleUrl: './slider.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DsSlider),
      multi: true,
    },
  ],
  host: {
    '[attr.data-size]': 'size()',
    '[class.ds-slider--disabled]': 'disabled()',
    '[class.ds-slider--with-tooltip]': 'valueTooltip()',
    '[class.ds-slider--with-tick-labels]': 'hasTickLabels()',
    // Los aliases consumen el atributo del host y se reenvían al input nativo
    // (lección aaa-016); acá se remueve del host para no duplicar el nombre
    // accesible en un elemento genérico (axe: aria-prohibited-attr).
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
})
export class DsSlider implements ControlValueAccessor {
  readonly value = model<number>(0);
  readonly disabled = model<boolean>(false);
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly label = input<string>('');
  readonly size = input<DsSliderSize>('md');
  /** Formateador opcional: alimenta `aria-valuetext`, el output y la burbuja. */
  readonly valueText = input<((value: number) => string) | null>(null);
  // Extras opt-in (apagados por default: el DOM mínimo es el de la referencia).
  readonly showValue = input<boolean>(false);
  readonly ticks = input<readonly DsSliderTick[]>([]);
  readonly valueTooltip = input<boolean>(false);
  // Sin label visible, el nombre accesible del consumidor se reenvía al input.
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  protected readonly inputId = `ds-slider-${nextSliderId++}`;
  /** true mientras hay un arrastre de pointer en curso (muestra la burbuja). */
  protected readonly dragging = signal(false);

  /** Porcentaje 0–100 del valor dentro del rango; la capa visual deriva de él. */
  protected readonly pct = computed(() => {
    const min = this.min();
    const span = this.max() - min;
    if (span <= 0) {
      return 0;
    }
    const clamped = Math.min(Math.max(this.value(), min), this.max());
    return ((clamped - min) / span) * 100;
  });

  protected readonly displayValue = computed(() => {
    const format = this.valueText();
    const value = this.value();
    return format ? format(value) : String(value);
  });

  protected readonly hasTickLabels = computed(() => this.ticks().some((t) => t.label));

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null | undefined): void {
    this.value.set(typeof value === 'number' && !Number.isNaN(value) ? value : this.min());
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected tickPct(value: number): number {
    const min = this.min();
    const span = this.max() - min;
    if (span <= 0) {
      return 0;
    }
    const clamped = Math.min(Math.max(value, min), this.max());
    return ((clamped - min) / span) * 100;
  }

  protected handleInput(event: Event): void {
    if (this.disabled()) {
      return;
    }
    // El input nativo ya clampeó al rango y al step; solo se numeriza y propaga.
    const value = Number((event.target as HTMLInputElement).value);
    this.value.set(value);
    this.onChange(value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}

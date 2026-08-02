import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { LucideX } from '@lucide/angular';

export type DsModalSize = 'sm' | 'md' | 'lg' | 'xl';

let nextHeadingId = 0;

// Scroll lock compartido: con modales anidados, el overflow del body se
// restaura recién cuando cierra el último (el top layer apila solo).
let openModalCount = 0;
let previousBodyOverflow = '';

function lockBodyScroll(): void {
  if (openModalCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  openModalCount++;
}

function unlockBodyScroll(): void {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
  }
}

@Component({
  selector: 'ds-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideX],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  host: {
    // Angular no remueve el atributo que un input con alias consume: sin esto,
    // el aria-* del consumidor quedaría duplicado en el host, donde no nombra
    // al diálogo y es en sí una violación (aria-prohibited-attr).
    '[attr.aria-label]': 'null',
    '[attr.aria-labelledby]': 'null',
  },
})
export class DsModal {
  readonly open = model<boolean>(false);
  readonly size = input<DsModalSize>('md');
  readonly heading = input<string>('');
  readonly closeLabel = input<string>('Cerrar');
  readonly closeOnEscape = input<boolean>(true);
  readonly closeOnOverlay = input<boolean>(true);
  // El rol de diálogo lo tiene el <dialog> interno, no el host: el nombre
  // accesible del consumidor se reenvía ahí (mismo patrón que DsSelect y
  // DsFieldBase). Sobre el host quedaría inerte y sería una violación por
  // atributo ARIA no permitido, así que los host bindings lo limpian.
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

  protected readonly headingId = `ds-modal-heading-${nextHeadingId++}`;

  // Precedencia: aria-labelledby explícito > heading > aria-label. Un
  // labelledby del consumidor es una instrucción directa y gana; el heading
  // gana sobre aria-label porque el nombre accesible debe coincidir con el
  // título visible cuando ambos existen (WCAG 2.5.3).
  protected readonly labelledBy = computed(
    () => this.ariaLabelledby() ?? (this.heading() ? this.headingId : null),
  );

  // Nunca los dos a la vez: con labelledby presente, el aria-label no se emite.
  protected readonly label = computed(() => (this.labelledBy() ? null : this.ariaLabel()));

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private holdsScrollLock = false;

  constructor() {
    effect(() => {
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;

      if (this.open()) {
        if (!dialog.open) dialog.showModal();
        if (!this.holdsScrollLock) {
          lockBodyScroll();
          this.holdsScrollLock = true;
        }
      } else {
        if (dialog.open) dialog.close();
        if (this.holdsScrollLock) {
          unlockBodyScroll();
          this.holdsScrollLock = false;
        }
      }
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.holdsScrollLock) {
        unlockBodyScroll();
        this.holdsScrollLock = false;
      }
    });
  }

  protected onCancel(event: Event): void {
    // ESC dispara `cancel` antes del cierre nativo. Se previene siempre y el
    // cierre pasa por el model, para que el estado del consumidor no diverja.
    event.preventDefault();
    if (this.closeOnEscape()) {
      this.open.set(false);
    }
  }

  protected onClose(): void {
    // Cierres nativos residuales (ej. form method="dialog"): sincronizar model.
    if (this.open()) {
      this.open.set(false);
    }
  }

  protected onBackdropClick(event: MouseEvent): void {
    // Un click sobre el backdrop llega con target === <dialog>; los clicks del
    // contenido llegan con target dentro del container y no cierran.
    if (event.target === this.dialogRef()?.nativeElement && this.closeOnOverlay()) {
      this.open.set(false);
    }
  }

  protected requestClose(): void {
    this.open.set(false);
  }
}

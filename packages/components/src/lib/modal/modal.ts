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
})
export class DsModal {
  readonly open = model<boolean>(false);
  readonly size = input<DsModalSize>('md');
  readonly heading = input<string>('');
  readonly closeLabel = input<string>('Cerrar');
  readonly closeOnEscape = input<boolean>(true);
  readonly closeOnOverlay = input<boolean>(true);

  protected readonly headingId = `ds-modal-heading-${nextHeadingId++}`;
  protected readonly labelledBy = computed(() => (this.heading() ? this.headingId : null));

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

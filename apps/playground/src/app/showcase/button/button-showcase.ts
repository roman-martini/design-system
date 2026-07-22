import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsButton } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-button-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button-showcase.html',
  imports: [DsButton, ShowcaseCase],
})
export class ButtonShowcase {
  /** Estado del demo interactivo de loading (se apaga solo tras simular una operación async). */
  protected readonly saving = signal(false);
  protected readonly variantsSnippet = `<ds-button variant="primary" (clicked)="save()">Primary</ds-button>
<ds-button variant="secondary" (clicked)="cancel()">Secondary</ds-button>
<ds-button variant="ghost" (clicked)="dismiss()">Ghost</ds-button>`;

  protected readonly sizesSnippet = `<ds-button size="sm">Small</ds-button>
<ds-button size="md">Medium</ds-button>
<ds-button size="lg">Large</ds-button>`;

  protected readonly disabledSnippet = `<!-- aria-disabled: sigue focuseable y anunciado (ADR-011) -->
<ds-button [disabled]="true">Primary disabled</ds-button>
<ds-button [disabled]="true" disabledReason="Completá los campos requeridos para continuar">
  Enviar
</ds-button>`;

  protected readonly loadingSnippet = `<!-- default: el spinner reemplaza el label conservando el ancho (cero layout shift) -->
<ds-button [loading]="saving()" (clicked)="save()">Guardar</ds-button>

<!-- loadingText opcional: spinner + texto de progreso (el botón se dimensiona al texto) -->
<ds-button [loading]="true" loadingText="Guardando…">Guardar</ds-button>`;

  protected readonly precedenceSnippet = `<!-- disabled: el motivo se muestra debajo del botón -->
<ds-button [disabled]="true" disabledReason="Completá los campos requeridos">Guardar</ds-button>

<!-- disabled + loading: aria-busy manda, el motivo se oculta (precedencia de loading) -->
<ds-button [loading]="true" [disabled]="true" disabledReason="Completá los campos requeridos">
  Guardar
</ds-button>`;

  protected logDemoClick(label: string): void {
    console.log(`[showcase] clicked: ${label}`);
  }

  /** Simula una operación async: enciende loading y lo apaga tras ~1.5s (demo del modo default). */
  protected simulateSave(): void {
    if (this.saving()) return;
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }
}

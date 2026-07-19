import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DsButton, DsToastService } from '@romanmartinidev/components';

/**
 * Caso de uso del showcase: título + demo renderizada (proyectada) + snippet
 * copiable (design.md §3-§4 de aaa-022). El botón de copiar y el feedback son
 * piezas del propio DS (CA-011.6).
 */
@Component({
  selector: 'app-showcase-case',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './showcase-case.html',
  styleUrl: './showcase-case.css',
  imports: [DsButton],
})
export class ShowcaseCase {
  readonly title = input.required<string>();
  readonly snippet = input.required<string>();

  private readonly toasts = inject(DsToastService);

  protected async copySnippet(): Promise<void> {
    if (!navigator.clipboard) {
      return; // entorno sin Clipboard API (jsdom, http sin secure context)
    }
    await navigator.clipboard.writeText(this.snippet());
    this.toasts.success('Snippet copiado');
  }
}

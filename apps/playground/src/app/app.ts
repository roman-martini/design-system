import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { SHOWCASE_ENTRIES } from './showcase/registry';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly entries = SHOWCASE_ENTRIES;

  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  private initialNavigation = true;

  constructor() {
    // A11y: al navegar, el foco se mueve al contenido principal para que
    // teclado y lectores de pantalla no queden varados en el sidebar.
    // La carga inicial se saltea (no robar el foco al abrir la app).
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this.initialNavigation) {
          this.initialNavigation = false;
          return;
        }
        // preventScroll: el scroll al top lo maneja el router (withInMemoryScrolling);
        // sin esto, focus() scrollea hasta el <main> y oculta el header.
        this.main().nativeElement.focus({ preventScroll: true });
      });
  }
}

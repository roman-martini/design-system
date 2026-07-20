import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DsSkeleton } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-skeleton-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton-showcase.html',
  imports: [DsSkeleton, ShowcaseCase],
})
export class SkeletonShowcase {
  protected readonly shapesSnippet = `<ds-skeleton shape="text" />
<ds-skeleton shape="rect" />
<ds-skeleton shape="circle" />

<!-- width/height/radius aceptan cualquier valor CSS y pisan el default -->
<ds-skeleton shape="rect" width="12rem" height="6rem" radius="16px" />`;

  protected readonly paragraphSnippet = `<!-- Multilínea por composición: la última línea más corta -->
<ds-skeleton />
<ds-skeleton />
<ds-skeleton width="60%" />`;

  protected readonly cardSnippet = `<!-- El contenedor anuncia la carga; cada bloque es decorativo (aria-hidden) -->
<div role="status" aria-label="Cargando perfil" [attr.aria-busy]="loading">
  <ds-skeleton shape="circle" />
  <ds-skeleton width="40%" />
  <ds-skeleton />
</div>`;
}

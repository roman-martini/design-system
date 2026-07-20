import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DsSkeletonShape = 'text' | 'rect' | 'circle';

@Component({
  selector: 'ds-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // El skeleton ES el bloque: host único, sin contenido — decorativo por contrato.
  template: '',
  styleUrl: './skeleton.css',
  host: {
    'aria-hidden': 'true',
    '[attr.data-shape]': 'shape()',
    '[style.width]': 'width() || null',
    '[style.height]': 'height() || null',
    '[style.borderRadius]': 'radius() || null',
  },
})
export class DsSkeleton {
  readonly shape = input<DsSkeletonShape>('text');
  // Strings CSS libres (px, %, rem…); vacío → default tokenizado del shape.
  readonly width = input<string>('');
  readonly height = input<string>('');
  readonly radius = input<string>('');
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsPagination } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-pagination-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination-showcase.html',
  imports: [DsPagination, ShowcaseCase],
})
export class PaginationShowcase {
  protected readonly basicPage = signal(1);
  protected readonly longPage = signal(10);
  protected readonly compactPage = signal(3);
  protected readonly edgePage = signal(1);

  protected readonly basicSnippet = `page = signal(1);

<ds-pagination [(page)]="page" [totalPages]="5" />`;

  protected readonly longSnippet = `<ds-pagination [(page)]="page" [totalPages]="50" [siblingCount]="1" />`;

  protected readonly compactSnippet = `<ds-pagination [(page)]="page" [totalPages]="20" variant="compact" />`;

  protected readonly edgeSnippet = `<!-- en la página 1, «/‹ quedan aria-disabled (focusables, ADR-011) -->
<ds-pagination [(page)]="page" [totalPages]="12" />`;
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DsAccordion, DsAccordionItem } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-accordion-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accordion-showcase.html',
  imports: [DsAccordion, DsAccordionItem, ShowcaseCase],
})
export class AccordionShowcase {
  protected readonly firstOpen = signal(true);

  protected readonly singleSnippet = `<ds-accordion>
  <ds-accordion-item [(expanded)]="open">
    <span dsAccordionHeader>¿Qué es el design system?</span>
    <p>Contenido de la sección…</p>
  </ds-accordion-item>
  <ds-accordion-item>…</ds-accordion-item>
</ds-accordion>`;

  protected readonly multipleSnippet = `<ds-accordion [multiple]="true">
  <ds-accordion-item>…</ds-accordion-item>
  <ds-accordion-item>…</ds-accordion-item>
</ds-accordion>`;

  protected readonly disabledSnippet = `<ds-accordion-item [disabled]="true">
  <span dsAccordionHeader>Sección no disponible</span>
  …
</ds-accordion-item>`;

  protected readonly nestedSnippet = `<ds-accordion>
  <ds-accordion-item>
    <span dsAccordionHeader>Sección padre</span>
    <ds-accordion [headingLevel]="4">
      <ds-accordion-item>…</ds-accordion-item>
    </ds-accordion>
  </ds-accordion-item>
</ds-accordion>`;
}

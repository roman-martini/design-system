import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DsSlider, type DsSliderTick } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-slider-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './slider-showcase.html',
  imports: [DsSlider, ReactiveFormsModule, ShowcaseCase],
})
export class SliderShowcase {
  protected readonly volume = signal(40);
  protected readonly brightness = new FormControl<number>(60, { nonNullable: true });

  protected readonly qualityTicks: readonly DsSliderTick[] = [
    { value: 0, label: 'Baja' },
    { value: 50, label: 'Media' },
    { value: 100, label: 'Alta' },
  ];

  protected readonly percent = (value: number): string => `${value} %`;

  protected readonly minimalSnippet = `<!-- El mínimo de la referencia: track + fill + thumb -->
<ds-slider label="Volumen" [(value)]="volume" />`;

  protected readonly valueSnippet = `<!-- Valor visible en un <output> asociado; formateador opcional -->
<ds-slider label="Brillo" [formControl]="brightness" [showValue]="true" [valueText]="percent" />`;

  protected readonly ticksSnippet = `<ds-slider label="Calidad" [min]="0" [max]="100" [step]="50" [ticks]="qualityTicks" />`;

  protected readonly tooltipSnippet = `<!-- Burbuja sobre el thumb al arrastrar o enfocar; no usa DsTooltip -->
<ds-slider label="Zoom" [valueTooltip]="true" [valueText]="percent" />`;

  protected readonly sizesSnippet = `<ds-slider size="sm" label="Small" />
<ds-slider size="md" label="Medium" />
<ds-slider size="lg" label="Large" />`;
}

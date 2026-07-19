import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DsInput, DsTab, DsTabs } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-tabs-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabs-showcase.html',
  imports: [DsInput, DsTab, DsTabs, ReactiveFormsModule, ShowcaseCase],
})
export class TabsShowcase {
  protected readonly activeTab = signal<string | null>(null);
  protected readonly emailCtrl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected readonly tabsSnippet = `active = signal<string | null>(null); // sin valor: el primer tab habilitado

<ds-tabs [(value)]="active" aria-label="Secciones">
  <ds-tab value="form" label="Formulario">…</ds-tab>
  <ds-tab value="info" label="Info">…</ds-tab>
  <ds-tab value="off" label="Deshabilitado" [disabled]="true">…</ds-tab>
</ds-tabs>`;
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DsTextarea } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-textarea-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './textarea-showcase.html',
  imports: [DsTextarea, ReactiveFormsModule, ShowcaseCase],
})
export class TextareaShowcase {
  protected readonly notesCtrl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected readonly formSnippet = `notes = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required],
});

<ds-textarea
  [formControl]="notes"
  [rows]="4"
  label="Notas"
  hint="Visible para todo tu equipo"
  error="La nota es obligatoria"
  placeholder="Escribí una nota…"
/>`;

  protected readonly sizesSnippet = `<ds-textarea size="sm" label="Small" />
<ds-textarea size="md" label="Medium" />
<ds-textarea size="lg" label="Large" />

<!-- resize configurable -->
<ds-textarea resize="none" label="Alto fijo" />`;
}

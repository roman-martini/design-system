import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DsInput } from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-input-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input-showcase.html',
  imports: [DsInput, ReactiveFormsModule, ShowcaseCase],
})
export class InputShowcase {
  protected readonly emailCtrl = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  protected readonly formSnippet = `email = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, Validators.email],
});

<ds-input
  [formControl]="email"
  type="email"
  label="Email"
  hint="Nunca compartimos tu email"
  error="Ingresá un email válido"
  placeholder="vos@ejemplo.com"
/>`;
}

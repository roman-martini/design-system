import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DsFieldBase, type DsFieldSize } from '../field/field-base';

export type DsInputType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
/** @deprecated Usar `DsFieldSize`. Alias conservado por compatibilidad. */
export type DsInputSize = DsFieldSize;

@Component({
  selector: 'ds-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.html',
  // field.css: wrapper compartido; input.css: solo lo específico del <input>.
  styleUrls: ['../field/field.css', './input.css'],
})
export class DsInput extends DsFieldBase {
  readonly type = input<DsInputType>('text');
}

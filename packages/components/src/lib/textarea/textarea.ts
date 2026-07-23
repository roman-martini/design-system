import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { DsFieldBase, type DsFieldSize } from '../field/field-base';

export type DsTextareaResize = 'vertical' | 'none';
/** Alias del tamaño del field, expuesto para tipar `ds-textarea[size]` (paridad con `DsInputSize`). */
export type DsTextareaSize = DsFieldSize;

@Component({
  selector: 'ds-textarea',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './textarea.html',
  // field.css: wrapper compartido; textarea.css: solo lo específico del <textarea>.
  styleUrls: ['../field/field.css', './textarea.css'],
})
export class DsTextarea extends DsFieldBase {
  readonly rows = input<number>(3);
  readonly resize = input<DsTextareaResize>('vertical');
}

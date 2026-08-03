import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
} from '@angular/core';

import { DsAvatar, type DsAvatarSize } from './avatar';
import { DS_AVATAR_GROUP, type DsAvatarGroupContext } from './avatar-group-token';

@Component({
  selector: 'ds-avatar-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar-group.html',
  styleUrl: './avatar-group.css',
  providers: [{ provide: DS_AVATAR_GROUP, useExisting: DsAvatarGroup }],
  host: {
    role: 'group',
    '[attr.aria-label]': 'label() || null',
  },
})
export class DsAvatarGroup implements DsAvatarGroupContext {
  /** Nombre accesible del grupo (ej. "Miembros del equipo"). */
  readonly label = input<string>('');
  /** Máximo de avatares visibles; el resto colapsa en "+N". `null` = sin límite. */
  readonly max = input<number | null>(null);
  /**
   * Nombre accesible del "+N", traducible por el consumidor. Recibe la cantidad
   * oculta en vez de ser un string con placeholder porque el texto entero
   * depende del número: traducirlo suele exigir pluralización ("1 more" vs
   * "2 more") u otro orden de palabras, y ninguna de las dos cosas se resuelve
   * concatenando fragmentos fijos.
   */
  readonly moreLabel = input<(count: number) => string>((count) => `y ${count} más`);

  private readonly avatars = contentChildren(DsAvatar);

  readonly hiddenAvatars = computed<ReadonlySet<unknown>>(() => {
    const max = this.max();
    const all = this.avatars();
    if (max === null || all.length <= max) {
      return new Set();
    }
    return new Set(all.slice(max));
  });

  protected readonly overflowCount = computed(() => this.hiddenAvatars().size);

  /** El "+N" hereda el size de los avatares del grupo. */
  protected readonly moreSize = computed<DsAvatarSize>(() => this.avatars()[0]?.size() ?? 'md');

  protected readonly moreText = computed(() => this.moreLabel()(this.overflowCount()));
}

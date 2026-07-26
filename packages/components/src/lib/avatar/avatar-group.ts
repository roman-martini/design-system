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

  protected readonly moreLabel = computed(() => `y ${this.overflowCount()} más`);
}

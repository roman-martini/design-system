import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';

import { DS_AVATAR_GROUP } from './avatar-group-token';

export type DsAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type DsAvatarTone = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'danger';

/** Orden fijo: cambiarlo cambiaría el tono asignado a cada nombre existente. */
const TONES: readonly DsAvatarTone[] = [
  'neutral',
  'primary',
  'success',
  'warning',
  'info',
  'danger',
];

/** Hash determinístico (design §1): mismo `name` → mismo tono, en cualquier app. */
export function avatarToneFromName(name: string): DsAvatarTone {
  let sum = 0;
  for (const ch of name) {
    sum = (sum + (ch.codePointAt(0) ?? 0)) % TONES.length;
  }
  return TONES[sum];
}

/** Primera letra de las dos primeras palabras (una palabra → 1 letra), uppercase. */
export function avatarInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .toLocaleUpperCase();
}

@Component({
  selector: 'ds-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
  host: {
    '[attr.data-size]': 'size()',
    '[attr.data-tone]': 'showImage() ? null : resolvedTone()',
    '[attr.data-in-group]': "group ? '' : null",
    '[attr.data-group-hidden]': "groupHidden() ? '' : null",
  },
})
export class DsAvatar {
  /** Fuente de las iniciales, del hash de tono y del nombre accesible. Vacío = decorativo. */
  readonly name = input<string>('');
  /** Imagen; ante error de carga se cae al fallback de iniciales. */
  readonly src = input<string | null>(null);
  readonly size = input<DsAvatarSize>('md');
  /** 'auto' (default) deriva el tono por hash de `name`; un tono concreto lo fija. */
  readonly tone = input<DsAvatarTone | 'auto'>('auto');

  // El element injector de un avatar proyectado incluye al grupo (árbol DOM del
  // template del consumidor) — mismo mecanismo que NgControl optional/self.
  protected readonly group = inject(DS_AVATAR_GROUP, { optional: true });

  // Se resetea solo al cambiar `src` (linkedSignal): un src nuevo re-intenta la imagen.
  private readonly imgFailed = linkedSignal({
    source: this.src,
    computation: () => false,
  });

  protected readonly showImage = computed(() => !!this.src() && !this.imgFailed());

  protected readonly initials = computed(() => avatarInitials(this.name()));

  protected readonly resolvedTone = computed<DsAvatarTone>(() => {
    const tone = this.tone();
    return tone === 'auto' ? avatarToneFromName(this.name()) : tone;
  });

  protected readonly groupHidden = computed(() => this.group?.hiddenAvatars().has(this) ?? false);

  protected onImgError(): void {
    this.imgFailed.set(true);
  }
}

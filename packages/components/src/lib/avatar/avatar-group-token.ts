import { InjectionToken, type Signal } from '@angular/core';

/**
 * Contexto que el grupo expone a sus avatares proyectados. Va en un archivo
 * neutral (ni avatar.ts ni avatar-group.ts) para cortar el ciclo de imports:
 * el grupo importa DsAvatar (contentChildren) y el avatar solo importa este token.
 */
export interface DsAvatarGroupContext {
  /** Avatares que exceden `max` y deben ocultarse (colapsados en el "+N"). */
  readonly hiddenAvatars: Signal<ReadonlySet<unknown>>;
}

export const DS_AVATAR_GROUP = new InjectionToken<DsAvatarGroupContext>('DS_AVATAR_GROUP');

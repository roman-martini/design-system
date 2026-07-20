import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  DsButton,
  DsMenu,
  DsMenuItem,
  DsMenuSeparator,
  DsMenuTrigger,
} from '@romanmartinidev/components';
import { LucideCopy, LucideDownload, LucidePencil, LucideTrash2 } from '@lucide/angular';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-menu-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu-showcase.html',
  imports: [
    DsButton,
    DsMenu,
    DsMenuItem,
    DsMenuSeparator,
    DsMenuTrigger,
    ShowcaseCase,
    LucideCopy,
    LucideDownload,
    LucidePencil,
    LucideTrash2,
  ],
})
export class MenuShowcase {
  protected lastAction = '';

  protected onAction(action: string): void {
    this.lastAction = action;
  }

  protected readonly basicSnippet = `<ds-button variant="secondary" [dsMenuTriggerFor]="acciones">Acciones</ds-button>

<ds-menu #acciones>
  <ds-menu-item (selected)="editar()">
    <svg lucidePencil size="16" strokeWidth="1.5" aria-hidden="true"></svg>
    Editar
  </ds-menu-item>
  <ds-menu-item (selected)="duplicar()">
    <svg lucideCopy size="16" strokeWidth="1.5" aria-hidden="true"></svg>
    Duplicar
  </ds-menu-item>
</ds-menu>`;

  protected readonly groupsSnippet = `<ds-menu #gestion>
  <ds-menu-item (selected)="editar()">Editar</ds-menu-item>
  <ds-menu-item [disabled]="true">Archivar</ds-menu-item>
  <ds-menu-separator />
  <ds-menu-item [danger]="true" (selected)="eliminar()">
    <svg lucideTrash2 size="16" strokeWidth="1.5" aria-hidden="true"></svg>
    Eliminar
  </ds-menu-item>
</ds-menu>`;

  protected readonly submenuSnippet = `<ds-menu #archivo>
  <ds-menu-item (selected)="renombrar()">Renombrar</ds-menu-item>
  <ds-menu-item [submenu]="exportar">
    <svg lucideDownload size="16" strokeWidth="1.5" aria-hidden="true"></svg>
    Exportar
  </ds-menu-item>
  <ds-menu #exportar>
    <ds-menu-item (selected)="exportarPdf()">Como PDF</ds-menu-item>
    <ds-menu-item (selected)="exportarCsv()">Como CSV</ds-menu-item>
  </ds-menu>
</ds-menu>`;
}

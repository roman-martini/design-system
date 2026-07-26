import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  DsAvatar,
  DsAvatarGroup,
  DsBadge,
  DsCard,
  DsCardDescription,
  DsCardHeader,
  DsCardTitle,
} from '@romanmartinidev/components';

import { ShowcaseCase } from '../ui/showcase-case';

@Component({
  selector: 'app-avatar-showcase',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar-showcase.html',
  imports: [
    DsAvatar,
    DsAvatarGroup,
    DsBadge,
    DsCard,
    DsCardDescription,
    DsCardHeader,
    DsCardTitle,
    ShowcaseCase,
  ],
})
export class AvatarShowcase {
  protected readonly team = [
    { name: 'Sofia Davis', email: 'm@example.com', role: 'Owner' },
    { name: 'Jackson Lee', email: 'p@example.com', role: 'Developer' },
    { name: 'Isabella Nguyen', email: 'i@example.com', role: 'Billing' },
  ];

  protected readonly basicSnippet = `<ds-avatar name="Sofia Davis" />              <!-- tono por hash del nombre -->
<ds-avatar name="Sofia Davis" tone="info" />  <!-- tono fijado manualmente -->
<ds-avatar name="Sofia Davis" src="…" />      <!-- imagen; error → fallback -->`;

  protected readonly groupSnippet = `<ds-avatar-group label="Miembros del equipo" [max]="3">
  <ds-avatar name="Sofia Davis" size="sm" />
  <ds-avatar name="Jackson Lee" size="sm" />
  <ds-avatar name="Isabella Nguyen" size="sm" />
  <ds-avatar name="Liam Brown" size="sm" />
  <ds-avatar name="Emma Wilson" size="sm" />
</ds-avatar-group>`;

  protected readonly teamSnippet = `<ds-card>
  <ds-card-header>
    <h2 dsCardTitle>Team Members</h2>
    <p dsCardDescription>Invite your team members to collaborate.</p>
  </ds-card-header>
  <!-- por miembro -->
  <ds-avatar [name]="member.name" size="md" />
  <ds-badge tone="neutral" appearance="outline">{{ member.role }}</ds-badge>
</ds-card>`;
}

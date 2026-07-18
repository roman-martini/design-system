import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { DsTabs, type DsTabRegistration } from './tabs';

let nextTabId = 0;

@Component({
  selector: 'ds-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tab.html',
  styleUrl: './tab.css',
  host: {
    role: 'tabpanel',
    tabindex: '0',
    '[id]': 'panelIdValue',
    '[attr.aria-labelledby]': 'tabIdValue',
    '[hidden]': '!isActive()',
  },
})
export class DsTab implements DsTabRegistration, OnInit, OnDestroy {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly disabled = input<boolean>(false);

  private readonly uid = nextTabId++;
  protected readonly panelIdValue = `ds-tabpanel-${this.uid}`;
  protected readonly tabIdValue = `ds-tab-${this.uid}`;

  private readonly tabs = inject(DsTabs);

  ngOnInit(): void {
    this.tabs.registerTab(this);
  }

  ngOnDestroy(): void {
    this.tabs.unregisterTab(this);
  }

  // DsTabRegistration
  valueProp(): string {
    return this.value();
  }

  labelText(): string {
    return this.label();
  }

  isDisabled(): boolean {
    return this.disabled();
  }

  tabId(): string {
    return this.tabIdValue;
  }

  panelId(): string {
    return this.panelIdValue;
  }

  protected isActive(): boolean {
    return this.tabs.isActiveValue(this.value());
  }
}

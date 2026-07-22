import { ChangeDetectionStrategy, Component } from '@angular/core';

// Selector híbrido (design §2 de aaa-032): como elemento (`<ds-card-title>`) o como
// atributo (`<h2 dsCardTitle>`) — el atributo preserva la semántica de heading del
// consumidor en el árbol de accesibilidad. Componente (no directiva) porque las
// directivas no llevan estilos y la encapsulación bloquearía el CSS proyectado.
@Component({
  selector: 'ds-card-title, [dsCardTitle]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-title.html',
  styleUrl: './card-title.css',
})
export class DsCardTitle {}

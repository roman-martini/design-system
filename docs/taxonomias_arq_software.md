# Taxonomía de Arquitecturas de Software

Mapa de referencia de los tipos de arquitectura que aplican al desarrollo de sistemas. Cada sección es independiente y extensible.

---

## Tabla de contenidos

1. [Concepto clave: niveles de escala](#1-concepto-clave-niveles-de-escala)
2. [Arquitectura de sistema](#2-arquitectura-de-sistema)
3. [Arquitectura de aplicación](#3-arquitectura-de-aplicación)
4. [Arquitectura frontend](#4-arquitectura-frontend)
5. [Arquitectura backend](#5-arquitectura-backend)
6. [Arquitectura de datos](#6-arquitectura-de-datos)
7. [Arquitectura de infraestructura](#7-arquitectura-de-infraestructura)
8. [Arquitectura de seguridad](#8-arquitectura-de-seguridad)
9. [Señales de problema transversales](#9-señales-de-problema-transversales)

---

## 1. Concepto clave: niveles de escala

No existe "la arquitectura" de un sistema. Existen decisiones arquitectónicas en múltiples niveles simultáneamente — un sistema real tiene todas a la vez.

```
Sistema completo
└── Arquitectura de sistema          ← cómo se comunican las piezas grandes
    ├── Arquitectura de aplicación   ← cómo está estructurada cada pieza internamente
    │   ├── Frontend
    │   └── Backend
    ├── Arquitectura de datos        ← cómo se almacena y fluye la información
    └── Arquitectura de infraestructura ← dónde y cómo corre todo
```

**Consecuencia práctica:** cuando un sistema es difícil de cambiar, casi siempre es porque una decisión en un nivel está contaminando otro — el dominio filtrado en la UI, la infraestructura acoplada al negocio, el estado global cuando debería ser local.

---

## 2. Arquitectura de sistema

Cómo se divide y comunica el sistema completo. Es la decisión de mayor impacto y la más costosa de revertir.

### Monolito

Todo el sistema en un único proceso desplegable.

- **Pros:** simple de desarrollar, debuggear y desplegar al inicio. Sin latencia de red entre módulos.
- **Contras:** escala como unidad completa. Un bug puede tirar todo. El equipo escala mal si el código no tiene fronteras internas.
- **Cuándo:** equipos chicos, producto en etapa temprana, dominio no claro todavía.

### Monolito modular

Un proceso, pero con fronteras internas explícitas entre módulos. Los módulos no se llaman directamente — usan interfaces o eventos internos.

- **Pros:** simplicidad operacional del monolito + separación de responsabilidades real.
- **Contras:** requiere disciplina. Sin enforcement técnico, las fronteras se erosionan.
- **Cuándo:** equipo mediano, dominio relativamente claro, no querés la complejidad operacional de microservicios.

### Microservicios

Servicios independientes por dominio, cada uno con su propio proceso y despliegue.

- **Pros:** escala y despliega cada servicio independientemente. Equip s autónomos por dominio.
- **Contras:** complejidad operacional alta. Latencia de red, consistencia eventual, distributed tracing, service discovery.
- **Cuándo:** equipos grandes, dominios bien definidos, necesidad real de escala o autonomía por equipo.

### Event-driven

Los componentes se comunican emitiendo y consumiendo eventos. No hay llamadas directas entre servicios. → [Leer más](02_arquitectura_de_sistema/01_event_driven.md)

- **Pros:** desacoplamiento fuerte. El productor no sabe quién consume.
- **Contras:** difícil de debuggear y razonar. Consistencia eventual por defecto.
- **Cuándo:** integraciones entre sistemas, workflows asíncronos, auditabilidad.

### SOA (Service-Oriented Architecture)

Similar a microservicios pero con contratos más formales (WSDL, ESB). Más común en enterprise legacy.

- **Cuándo:** integración de sistemas heterogéneos en enterprise. Raramente es la elección correcta para sistemas nuevos.

---

## 3. Arquitectura de aplicación

Cómo está organizado el código dentro de cada servicio o aplicación. Aplica tanto a frontend como a backend.

### Layered (N-tier)

Capas horizontales: presentación → lógica de negocio → acceso a datos. Cada capa solo habla con la siguiente. → [Leer más](03_arquitectura_de_aplicacion/01_layered_architecture.md)

- **Pros:** fácil de entender, ampliamente conocida.
- **Contras:** tiende al acoplamiento vertical. La lógica de negocio termina dependiendo de la base de datos.
- **Cuándo:** sistemas simples, CRUD-heavy, equipos sin experiencia en otras arquitecturas.

### Hexagonal (Ports & Adapters)

El dominio al centro. → [Leer más](03_arquitectura_de_aplicacion/02_hexagonal_architecture.md) Todo lo externo (DB, API, UI, queues) es un adaptador que implementa un puerto (interfaz). El dominio no sabe nada de la infraestructura.

- **Pros:** el dominio es testeable sin infraestructura. Fácil de cambiar adaptadores.
- **Contras:** más boilerplate. Puede ser overkill para lógica simple.
- **Cuándo:** lógica de negocio compleja, necesidad de tests sin infraestructura, múltiples formas de entrada/salida.

### Clean Architecture

Variante de hexagonal con capas concéntricas más explícitas: entities → use cases → interface adapters → frameworks. La regla de dependencia es estricta: las capas internas no conocen las externas.

- **Pros:** separación muy clara. El dominio es completamente independiente.
- **Contras:** más estructura inicial. Puede generar indirección innecesaria en sistemas simples.
- **Cuándo:** sistemas de larga vida, equipo con experiencia, dominio complejo.

### DDD (Domain-Driven Design)

Organización por dominios de negocio con lenguaje ubicuo, bounded contexts, aggregates, entities y value objects. Es un approach de modelado, no solo una arquitectura de capas.

- **Pros:** el código refleja el negocio. Reduce el gap entre devs y expertos de dominio.
- **Contras:** curva de aprendizaje alta. Requiere colaboración real con el negocio.
- **Cuándo:** dominio complejo, equipo comprometido con el proceso, sistema de larga vida.

### CQRS (Command Query Responsibility Segregation)

Separar las operaciones de escritura (commands) de las de lectura (queries). Pueden tener modelos de datos diferentes.

- **Pros:** optimiza lecturas y escrituras independientemente. Escala bien.
- **Contras:** consistencia eventual entre el modelo de escritura y el de lectura. Más complejidad.
- **Cuándo:** alto volumen de lecturas vs escrituras, necesidad de read models optimizados.

### Event Sourcing

El estado de la aplicación se deriva de una secuencia inmutable de eventos. No se guarda el estado actual — se guardan los eventos que lo produjeron.

- **Pros:** auditoría completa. Reproducir el estado en cualquier punto del tiempo. Natural con CQRS.
- **Contras:** complejidad alta. Evolución del schema de eventos difícil. Queries ad-hoc complicadas.
- **Cuándo:** dominios donde el historial de cambios tiene valor propio (finanzas, auditoría, sistemas legales).

### Patrones de diseño del dominio

Principios que definen cómo se diseñan los objetos dentro de la capa de dominio. Aplican dentro de cualquier arquitectura (Layered, Hexagonal, Clean).

#### Rich Domain Model

Los objetos de dominio encapsulan datos **y** comportamiento. La lógica de negocio vive en las entidades, no en los Services.

```typescript
// ✅ El User sabe cómo comportarse
class User {
  addCredits(amount: number): void {
    if (this.suspended) throw new Error('Usuario suspendido');
    if (amount <= 0) throw new Error('Monto inválido');
    this.credits += amount;
  }

  suspend(): void {
    if (this.suspended) throw new Error('Ya suspendido');
    this.suspended = true;
  }
}
```

- **Pros:** la lógica está donde pertenece. El Service orquesta, no implementa reglas. Más fácil de testear el dominio en aislamiento.
- **Contras:** requiere disciplina para no mezclar lógica de dominio con lógica de aplicación.
- **Cuándo:** siempre que haya reglas de negocio reales. Es el default correcto.

#### Anemic Domain Model _(antipatrón)_

Los objetos de dominio son bolsas de datos (solo propiedades). Toda la lógica vive en los Services, que se inflan indefinidamente.

```typescript
// ❌ User no sabe nada de sí mismo
class User {
  id: string;
  credits: number;
  suspended: boolean;
}

// Toda la lógica migra al Service
class UserService {
  addCredits(user: User, amount: number) { ... }
  suspend(user: User) { ... }
  canPurchase(user: User, price: number) { ... }
  // 500 líneas más...
}
```

- **Por qué ocurre:** es el resultado natural de aplicar Layered sin prestar atención al diseño del dominio.
- **Señal de alarma:** Services con cientos de líneas, entidades que son solo getters/setters.

---

## 4. Arquitectura frontend

Se subdivide en áreas ortogonales — podés tener excelente arquitectura de componentes y pésima de estado al mismo tiempo.

### 4.1 Rendering

Dónde y cuándo se genera el HTML.

| Estrategia | Descripción | Cuándo |
|---|---|---|
| **CSR** (Client-Side Rendering) | El browser recibe JS vacío y renderiza todo | Apps con mucha interactividad, detrás de auth |
| **SSR** (Server-Side Rendering) | El servidor genera HTML en cada request | SEO importante, contenido dinámico por usuario |
| **SSG** (Static Site Generation) | HTML generado en build time | Contenido que no cambia frecuentemente |
| **ISR** (Incremental Static Regeneration) | SSG con revalidación periódica | Contenido que cambia pero no en tiempo real |
| **Streaming** | El servidor envía HTML en chunks mientras procesa | UX percibida mejor, hidratación progresiva |

### 4.2 Componentes

Cómo se organiza y jerarquiza la UI.

- **Atomic Design** — átomos → moléculas → organismos → templates → páginas
- **Micro-frontends** — cada equipo es dueño de su porción de UI, desplegada independientemente
- **Web Components** — componentes nativos del browser, reutilizables entre frameworks
- **Module Federation** — compartir componentes/código entre apps en runtime

### 4.3 Estado

Cómo fluye y se gestiona la información en el cliente.

| Tipo | Ejemplos | Para qué |
|---|---|---|
| **Local** | `useState`, señales | Estado de un componente |
| **Global** | Redux, Zustand, Pinia | Estado compartido entre componentes lejanos |
| **Server state** | TanStack Query, SWR | Datos que vienen del servidor, caché, sincronización |
| **URL state** | query params, path | Estado que debe ser shareable o bookmarkeable |

### 4.4 Estilos

Cómo se organiza el CSS. → [Leer más](04_arquitectura_frontend/01_css_architecture.md)

- **CSS Modules** — scoping por archivo, sin colisiones
- **CSS-in-JS** — estilos en el JS, dinámicos por props
- **CSS Layers** (`@layer`) — cascada explícita y controlada
- **Utility-first** (Tailwind) — clases atómicas en el markup
- **BEM** — convención de nomenclatura para CSS global

### 4.5 Performance

Estrategia de carga y ejecución.

- **Code splitting** — dividir el bundle por ruta o componente
- **Lazy loading** — cargar componentes solo cuando se necesitan
- **Bundle strategy** — qué va en el bundle inicial vs en chunks asíncronos
- **Critical CSS** — inlinear solo el CSS necesario para el first paint

### 4.6 Design Systems

Infraestructura compartida de diseño y desarrollo: tokens, componentes, documentación y gobernanza. → [Leer más](04_arquitectura_frontend/02_design_systems.md)

- **Design Tokens** — valores de diseño organizados en capas (primitives → semantic → component)
- **Component Library** — componentes reutilizables con variantes, estados y contratos de API
- **Documentación viva** — Storybook, ejemplos interactivos, guías de uso
- **Versioning y gobernanza** — cómo evoluciona sin romper a los consumidores

---

## 5. Arquitectura backend

### 5.1 API

La interfaz que expone el backend al mundo.

| Estilo | Cuándo |
|---|---|
| **REST** | API pública, equipos múltiples, convención conocida |
| **GraphQL** | El cliente necesita control sobre qué datos pide |
| **gRPC** | Comunicación interna entre servicios, performance crítica |
| **tRPC** | Full-stack TypeScript, tipado end-to-end sin schema manual |
| **WebSocket** | Comunicación bidireccional en tiempo real |

**Patrones de API:**
- **BFF (Backend for Frontend)** — un backend específico por cliente (mobile, web, etc.)
- **API Gateway** — punto de entrada único que enruta, autentica y agrega

### 5.2 Dominio

Cómo está organizada la lógica de negocio. Ver [Arquitectura de aplicación](#3-arquitectura-de-aplicación) — aplican los mismos patrones (Hexagonal, Clean, DDD).

### 5.3 Acceso a datos

- **Repository pattern** — abstrae el acceso a datos detrás de una interfaz
- **ORM** — mapeo objeto-relacional (Prisma, TypeORM, Hibernate)
- **Query builder** — control más fino sin ORM completo (Knex, Drizzle)
- **Read models** — modelos denormalizados optimizados para lectura (común con CQRS)

### 5.4 Async y mensajería

- **Queues** — procesamiento asíncrono de tareas (BullMQ, SQS)
- **Message brokers** — pub/sub entre servicios (Kafka, RabbitMQ, NATS)
- **Pub/Sub** — patrón de comunicación desacoplada
- **Sagas** — coordinación de transacciones distribuidas

### 5.5 Caché

- **In-process** — caché en memoria dentro del proceso (Map, LRU cache)
- **Distribuido** — Redis, Memcached — compartido entre instancias
- **CDN** — caché de assets y respuestas HTTP en el edge
- **Query cache** — caché a nivel de ORM o query builder

---

## 6. Arquitectura de datos

### 6.1 Modelos de almacenamiento

| Tipo | Ejemplos | Para qué |
|---|---|---|
| **Relacional** | PostgreSQL, MySQL | Datos estructurados con relaciones y transacciones ACID |
| **Documento** | MongoDB, Firestore | Datos semi-estructurados, esquema flexible |
| **Grafo** | Neo4j, DGraph | Relaciones complejas entre entidades |
| **Columnar** | Cassandra, BigQuery | Grandes volúmenes, queries analíticas |
| **Time-series** | InfluxDB, TimescaleDB | Métricas, eventos temporales |
| **Key-value** | Redis, DynamoDB | Acceso por clave, alta performance |

### 6.2 OLTP vs OLAP

- **OLTP** (Online Transaction Processing) — operaciones transaccionales del sistema, baja latencia, muchas escrituras pequeñas
- **OLAP** (Online Analytical Processing) — análisis y reportes, queries complejas sobre grandes volúmenes

Suelen vivir en sistemas separados: la DB operacional (OLTP) alimenta un warehouse o lakehouse (OLAP).

### 6.3 Movimiento de datos

- **ETL** (Extract, Transform, Load) — transformación antes de cargar al destino
- **ELT** (Extract, Load, Transform) — cargar crudo y transformar en destino (común en cloud)
- **Streaming** — datos procesados en tiempo real (Kafka Streams, Flink)
- **Batch** — procesamiento periódico de grandes volúmenes

### 6.4 Patrones avanzados

- **Data Warehouse** — datos estructurados para análisis (Redshift, BigQuery, Snowflake)
- **Data Lakehouse** — combina flexibilidad del data lake con estructura del warehouse (Databricks, Delta Lake)
- **Event Sourcing** — ver [Arquitectura de aplicación](#event-sourcing)

---

## 7. Arquitectura de infraestructura

### 7.1 Modelos de despliegue

| Modelo | Descripción |
|---|---|
| **IaaS** | VM, networking, storage — control total, gestión total |
| **PaaS** | Plataforma gestionada, vos traés el código (Heroku, Railway) |
| **Containers** | Docker + orquestación (Kubernetes, ECS) |
| **Serverless** | Funciones por evento, sin gestión de servidores (Lambda, Cloud Functions) |
| **Edge** | Ejecución cerca del usuario (Cloudflare Workers, Vercel Edge) |

### 7.2 Observabilidad

Los tres pilares:

- **Logs** — registros de eventos (structured logging es obligatorio)
- **Métricas** — datos numéricos en el tiempo (latencia, error rate, throughput)
- **Trazas** — seguimiento de un request a través de múltiples servicios

### 7.3 IaC (Infrastructure as Code)

- **Terraform** — declarativo, multi-cloud, el estándar de facto
- **Pulumi** — IaC con lenguajes de programación reales (TypeScript, Python)
- **CDK** — IaC con lenguajes para AWS específicamente

---

## 8. Arquitectura de seguridad

### 8.1 Identidad y acceso

- **AuthN** (Autenticación) — verificar quién sos. Protocolos: OAuth2, OIDC, SAML, passkeys
- **AuthZ** (Autorización) — verificar qué podés hacer

| Modelo de AuthZ | Cuándo |
|---|---|
| **RBAC** (Role-Based) | Roles fijos, fácil de entender |
| **ABAC** (Attribute-Based) | Reglas basadas en atributos del usuario/recurso/entorno |
| **ReBAC** (Relation-Based) | Permisos basados en relaciones entre entidades (Google Zanzibar) |

### 8.2 Patrones

- **Zero-trust** — no asumir confianza por estar en la red interna. Verificar siempre.
- **Gestión de secretos** — Vault, AWS Secrets Manager. Nunca secrets en código o variables de entorno hardcodeadas.
- **mTLS** — autenticación mutua entre servicios

### 8.3 Threat modeling

Proceso para identificar amenazas antes de diseñar.

- **STRIDE** — Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege
- **PASTA** — Process for Attack Simulation and Threat Analysis

---

## 9. Señales de problema transversales

Indicadores de que una decisión arquitectónica está fallando, independientemente del nivel.

| Señal | Causa probable |
|---|---|
| Cambio en un módulo rompe otro sin relación | Acoplamiento oculto |
| Imposible testear sin levantar toda la infraestructura | Dominio acoplado a infraestructura |
| Todos los cambios pasan por el mismo archivo/módulo | God object / falta de separación |
| El equipo no puede describir las fronteras del sistema | Arquitectura no documentada o inexistente |
| Deploy lento porque hay que desplegar todo junto | Monolito sin modularización |
| Queries lentas que nadie puede optimizar | Modelo de datos no alineado con los casos de uso |
| Estado compartido que nadie entiende del todo | Gestión de estado sin ownership claro |

---

*Documento vivo — cada sección puede expandirse con patrones específicos, ejemplos de código, ADRs y comparaciones detalladas.*

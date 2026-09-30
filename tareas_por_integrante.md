# 📋 PsicoRed — Tareas de Testing por Integrante
> Documento para compartir con el equipo | Progra III 2026

---

# ✅ AMIR — Tus tareas de testing

## 🔴 Tests que VOS implementás

### Test Unitario 1 — `auth.service.js` → `login()`
**Archivo a crear**: `Backend/__tests__/unit/auth.service.test.js`
**Rama Git**: `test/unitario-auth`

**Qué tiene que hacer el test**:
El método `login()` en `auth.service.js` llama a Supabase para buscar el usuario. Si no lo encuentra (o devuelve error), tiene que lanzar la excepción `'Credenciales incorrectas'`. Tu test tiene que verificar que eso pasa, **sin usar Supabase real** — mockeás el cliente con `jest.mock()`.

**Subtareas**:
- [ ] Leer `Backend/src/modules/auth/auth.service.js` completo
- [ ] Identificar las 2 dependencias externas: `supabaseClient` y `bcrypt`
- [ ] Escribir `jest.mock('../../db/supabaseClient')` con el comportamiento simulado
- [ ] Implementar el `describe` / `it` / `expect`
- [ ] Verificar que el test pasa ✅ y que si quitás el `if (error || !usuario)` falla ❌

**Assertion principal**:
```js
await expect(authService.login('x@x.com', 'pass')).rejects.toThrow('Credenciales incorrectas')
```

---

### Test Unitario 2 — `auth.service.js` → `register()`
**Archivo**: mismo `auth.service.test.js` (agregarlo abajo)
**Misma rama**: `test/unitario-auth`

**Qué tiene que hacer el test**:
El método `register()` primero chequea si el email ya existe. Si existe, lanza `'Ya existe una cuenta con ese correo electrónico'`. Tu test simula que Supabase devuelve un usuario existente y verifica que el error se lanza.

**Subtareas**:
- [ ] Entender que `register()` hace DOS queries a Supabase (primero busca, después inserta)
- [ ] Mockear solo la primera query para que devuelva un usuario existente
- [ ] Verificar que el error correcto se lanza

**Assertion principal**:
```js
await expect(authService.register('existente@mail.com', 'password123'))
  .rejects.toThrow('Ya existe una cuenta')
```

---

### Test de Integración 1 — `POST /api/auth/login`
**Archivo a crear**: `Backend/__tests__/integration/auth.integration.test.js`
**Rama Git**: `test/integracion-auth`

**Qué es un test de integración acá**:
Usás `supertest` para hacer un request HTTP real a tu app Express (`app.js`). El controller, el service, el bcrypt y el JWT funcionan **de verdad**. Solo mockeás Supabase para que devuelva un usuario pre-configurado.

**Setup necesario**:
```js
const request = require('supertest')
const app = require('../../src/app')
// jest.mock para supabaseClient
```

**Subtareas**:
- [ ] Instalar: `npm install --save-dev jest supertest` en la carpeta `Backend/`
- [ ] Agregar al `package.json`: `"test": "jest --testEnvironment=node"`
- [ ] Generar un hash bcrypt real para usar en el mock del usuario
- [ ] Implementar test: login exitoso → `200` con `token` en la respuesta
- [ ] Implementar test: contraseña incorrecta → `401`
- [ ] Implementar test: campos faltantes → `400`

**Assertion principal**:
```js
const res = await request(app).post('/api/auth/login')
  .send({ email: 'test@mail.com', password: 'password123' })
expect(res.status).toBe(200)
expect(res.body).toHaveProperty('token')
expect(res.body.usuario.email).toBe('test@mail.com')
```

---

## 🟡 Tests que VOS revisás (de otros)

| Test | De quién | Qué verificar |
|------|----------|---------------|
| U4 — `rolMiddleware()` | Facu | ¿Los mocks de `req`, `res`, `next` están bien hechos? ¿Se prueba el caso exitoso también? |
| I3 — `POST /api/derivaciones` | Kiara | ¿Los middlewares de auth y rol NO están mockeados? ¿La lógica del service es real? |
| E2E — `POST /api/pacientes` | Kiara + Eve | ¿El test toca realmente todas las capas? ¿Hay teardown? |

---

## 🔵 Participación general

- **Reunión de kickoff**: decidir estrategia de BD para el E2E (¿Supabase real o mock?)
- **Revisión final**: ejecutar `npm test` en Backend y verificar que todos pasan

---

## ⚙️ Setup inicial (hacerlo antes de empezar)

```bash
cd Backend
npm install --save-dev jest supertest
```

Agregar en `Backend/package.json`:
```json
"scripts": {
  "dev": "nodemon src/index.js",
  "start": "node src/index.js",
  "seed": "node src/db/seed.js",
  "test": "jest --testEnvironment=node"
},
"jest": {
  "testEnvironment": "node",
  "testMatch": ["**/__tests__/**/*.test.js"]
}
```

---
---

# ✅ FACU — Tus tareas de testing

## 🔴 Tests que VOS implementás

### Test Unitario 3 — `derivaciones.service.js` → `create()`
**Archivo a crear**: `Backend/__tests__/unit/derivaciones.service.test.js`
**Rama Git**: `test/unitario-derivaciones`

**Qué tiene que hacer el test**:
El método `create()` primero chequea si ya existe una derivación activa entre el mismo paciente y profesional. Si existe, lanza un error. Tu test mockea Supabase para que el chequeo devuelva un registro existente y verifica que el error se lanza.

**Subtareas**:
- [ ] Leer `Backend/src/modules/derivaciones/derivaciones.service.js`
- [ ] Identificar que hay DOS queries: primero el chequeo de duplicado, después el insert
- [ ] Mockear Supabase para que el chequeo devuelva `{ data: { id: 'uuid' }, error: null }`
- [ ] Verificar que el insert **nunca se llama** cuando hay duplicado
- [ ] Agregar test del caso exitoso (sin duplicado → se crea)

**Assertion principal**:
```js
await expect(derivacionesService.create(
  { paciente_id: 'p1', profesional_id: 'pr1' },
  'user-uuid'
)).rejects.toThrow('ya tiene una derivación pendiente')
```

---

### Test Unitario 4 — `rol.middleware.js` → `rolMiddleware()`
**Archivo a crear**: `Backend/__tests__/unit/rol.middleware.test.js`
**Rama Git**: `test/unitario-middleware`

**Qué tiene que hacer el test**:
`rolMiddleware` es una función que devuelve un middleware. El test más simple del proyecto: no hay BD, no hay servicios, solo lógica pura. Creás mocks manuales de `req`, `res` y `next`, y verificás que cuando el rol del usuario no está permitido, se llama `res.status(403)`.

**Subtareas**:
- [ ] Crear mocks manuales con `jest.fn()` para `req`, `res` y `next`
- [ ] Crear `res.status` que devuelva un objeto con `.json` (chaining)
- [ ] Test 1: rol no permitido → `res.status(403)` llamado, `next` NO llamado
- [ ] Test 2: rol sí permitido → `next()` llamado, `res.status` NO llamado

**Assertion principal**:
```js
const middleware = rolMiddleware('administrador')
const req = { user: { rol: 'profesional' } }
const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
const next = jest.fn()

middleware(req, res, next)

expect(res.status).toHaveBeenCalledWith(403)
expect(next).not.toHaveBeenCalled()
```

---

### Test de Integración 2 — `POST /api/pacientes`
**Archivo a crear**: `Backend/__tests__/integration/pacientes.integration.test.js`
**Rama Git**: `test/integracion-pacientes`

**Qué es un test de integración acá**:
Request HTTP real con supertest. El controller y el service funcionan de verdad. Para las rutas protegidas, generás un JWT válido en el test. Solo mockeás Supabase.

**Subtareas**:
- [ ] Generar un JWT de test con `jwt.sign({ id: 'u1', email: 'test@mail.com', rol: 'profesional' }, process.env.JWT_SECRET)`
- [ ] Implementar test: sin token → `401`
- [ ] Implementar test: campos incompletos (falta `apellido`) → `400` con mensaje específico
- [ ] Implementar test: email inválido → `400`
- [ ] Implementar test: todos los campos correctos → `201` (con Supabase mockeado para el insert)

**Assertion principal**:
```js
const res = await request(app)
  .post('/api/pacientes')
  .set('Authorization', `Bearer ${tokenValido}`)
  .send({ nombre: 'Juan' }) // falta apellido, email, telefono
expect(res.status).toBe(400)
expect(res.body.error).toMatch(/requeridos/)
```

---

## 🟡 Tests que VOS revisás (de otros)

| Test | De quién | Qué verificar |
|------|----------|---------------|
| U1 — `auth.service.login()` | Amir | ¿El mock de Supabase está bien configurado? ¿Hay test del caso de contraseña incorrecta también? |
| I1 — `POST /api/auth/login` | Amir | ¿El bcrypt y JWT son reales (no mockeados)? ¿Se prueban los 3 casos? |
| Test Front — `Login.vue` | Eve | ¿Los escenarios cubren lo que pide la consigna? ¿Hay caso de error? |

---

## 🔵 Participación general

- **Reunión de kickoff**: decidir estrategia de BD para el E2E
- **E2E**: revisar el formato de respuesta y los edge cases implementados por Kiara y Eve
- **Revisión final**: ejecutar `npm test` y verificar resultado

---

## ⚙️ Setup inicial

Igual que Amir — ver sección de Setup de la tarjeta de Amir.

---
---

# ✅ KIARA — Tus tareas de testing

## 🔴 Tests que VOS implementás

### Test Unitario 5 — `pacientes.service.js` → `create()`
**Archivo a crear**: `Backend/__tests__/unit/pacientes.service.test.js`
**Rama Git**: `test/unitario-pacientes`

**Qué tiene que hacer el test**:
En `pacientes.service.js` hay esta línea:
```js
const estadoFinal = body && body.estado ? body.estado : 'activo'
```
Esta lógica asigna `'activo'` como estado por defecto si no se especifica uno. Tu test verifica que cuando se llama a `create()` sin el campo `estado`, el insert a Supabase se hace con `estado: 'activo'`.

**Subtareas**:
- [ ] Leer `Backend/src/modules/pacientes/pacientes.service.js` línea a línea
- [ ] Mockear `supabaseClient` para capturar con qué datos se llamó al insert
- [ ] Test 1: sin campo `estado` → el insert tiene `estado: 'activo'`
- [ ] Test 2: con `estado: 'inactivo'` en el body → el insert respeta ese valor
- [ ] Verificar que el resultado retornado también tiene el estado correcto

**Assertion principal**:
```js
// Verificar que supabase fue llamado con el estado correcto
expect(mockInsert).toHaveBeenCalledWith(
  expect.objectContaining({ estado: 'activo' })
)
```

---

### Test de Integración 3 — `POST /api/derivaciones`
**Archivo a crear**: `Backend/__tests__/integration/derivaciones.integration.test.js`
**Rama Git**: `test/integracion-derivaciones`

**Qué es un test de integración acá**:
Esta ruta requiere JWT con `rol: 'administrador'`. El auth middleware Y el rol middleware funcionan de verdad. La lógica anti-duplicado del service también es real. Solo mockeás Supabase.

**Subtareas**:
- [ ] Generar JWT con `rol: 'administrador'` para el test
- [ ] Test 1: JWT de profesional intentando crear derivación → `403`
- [ ] Test 2: campos requeridos faltantes (`paciente_id` o `profesional_id`) → `400`
- [ ] Test 3: derivación duplicada (Supabase mock devuelve existente en el chequeo) → `400` con mensaje `'derivación pendiente'`
- [ ] Test 4: creación exitosa (Supabase mock devuelve null en el chequeo + datos en el insert) → `201`

**Assertion principal** (caso duplicado):
```js
const res = await request(app)
  .post('/api/derivaciones')
  .set('Authorization', `Bearer ${tokenAdmin}`)
  .send({ paciente_id: 'p1', profesional_id: 'pr1' })
expect(res.status).toBe(400)
expect(res.body.error).toMatch(/derivación pendiente/)
```

---

### E2E — `POST /api/pacientes` (responsable principal 1)
**Archivo a crear**: `Backend/__tests__/e2e/pacientes.e2e.test.js`
**Rama Git**: `test/e2e-pacientes` (compartida con Eve)

**Tu parte del E2E**:
- Implementar el **happy path**: POST con todos los datos válidos + JWT → `201` con el paciente creado en la respuesta
- Implementar test de **email inválido**: body con email malformado → `400`
- Coordinar con Eve para el setup del entorno

**Estrategia**: Supabase **mockeado** (igual que los tests de integración). Podés partir directamente de la estructura de `pacientes.integration.test.js` de Facu y ampliar los escenarios.

> **Upgrade opcional (si hay tiempo)**: Amir puede agregar la configuración de `.env.test` para conectar a Supabase real + teardown. No es obligatorio.

---

## 🟡 Tests que VOS revisás (de otros)

| Test | De quién | Qué verificar |
|------|----------|---------------|
| U3 — `derivaciones.service.create()` | Facu | ¿El mock tiene el doble comportamiento (chequeo vs insert)? ¿Se verifica que el insert no se llama cuando hay duplicado? |
| I1 — `POST /api/auth/login` | Amir | ¿Están mockeados solo Supabase? ¿bcrypt y JWT son reales? |
| Test Front — `Login.vue` | Eve | ¿Los mocks de Pinia son correctos? ¿`setActivePinia` se usa bien? |

---

## 🔵 Participación general

- **Reunión de kickoff**: el E2E se hace con **Supabase mockeado** (ya decidido). Arrancar desde `test/e2e-pacientes`.
- **Revisión final**: ejecutar todos los tests y verificar

---

## ⚙️ Setup inicial

Igual que Amir — ver sección de Setup de la tarjeta de Amir.

---
---

# ✅ EVE — Tus tareas de testing

## 🔴 Tests que VOS implementás

### Test Frontend — `Login.vue` (responsable principal)
**Archivo a crear**: `Front/src/__tests__/Login.test.js`
**Rama Git**: `test/front-login`

**Contexto del componente**:
- El componente `Login.vue` tiene UN solo formulario de login (y uno de registro que se muestra con slide animation).
- El login llama a `authStore.login(email, password)` (acción de Pinia).
- Si el login tiene éxito, hace `router.push('/dashboard')`.
- Si falla, muestra el error en `.form-error`.
- Los IDs de los campos son: `#email-login` y `#password-login`.

**Qué se mockea**:
- `authStore.login` → reemplazarlo con `vi.fn()` para controlar si resuelve o rechaza
- `useRouter().push` → mock para verificar la redirección

**Qué NO se mockea**:
- El componente en sí (se monta real con `mount()`)
- La reactividad de Vue
- El template y la lógica de `handleLogin`

**Subtareas**:
- [ ] Instalar librerías en `Front/`: `npm install --save-dev vitest @vue/test-utils jsdom`
- [ ] Agregar en `Front/vite.config.js`:
  ```js
  test: {
    environment: 'jsdom',
    globals: true
  }
  ```
- [ ] Agregar en `Front/package.json`: `"test": "vitest"`
- [ ] Crear `Front/src/__tests__/Login.test.js`
- [ ] Setup del test con `setActivePinia(createPinia())`
- [ ] Mockear `authStore.login` con `vi.fn().mockResolvedValue()`
- [ ] Mockear `useRouter` → `{ push: vi.fn() }`
- [ ] **Test 1**: render inicial — el formulario con `#email-login` existe
- [ ] **Test 2**: submit exitoso → `authStore.login` llamado con los datos correctos + `router.push('/dashboard')` llamado
- [ ] **Test 3**: si `authStore.login` lanza error → el elemento `.form-error` es visible con el mensaje

**Ejemplo de estructura del test**:
```js
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { vi } from 'vitest'
import Login from '../components/Login.vue'

// mock del router
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({})
}))

describe('Login.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renderiza el formulario de login', () => {
    const wrapper = mount(Login)
    expect(wrapper.find('#email-login').exists()).toBe(true)
  })
  
  it('llama a authStore.login y redirige al dashboard', async () => {
    // ...
  })
  
  it('muestra error si el login falla', async () => {
    // ...
  })
})
```

---

### E2E — `POST /api/pacientes` (responsable principal 2)
**Archivo**: `Backend/__tests__/e2e/pacientes.e2e.test.js` (compartido con Kiara)
**Rama**: `test/e2e-pacientes`

**Tu parte del E2E**:
- Implementar test: **sin token** → `401`
- Implementar test: **datos incompletos** → `400` con mensaje específico
- Implementar **`afterAll` / teardown**: NO es necesario para la versión con mock (no hay datos reales que limpiar). Si en el futuro se migra a BD real, aquí va el borrado de registros.
- Documentar en un `README_TESTS.md` cómo correr los tests (tanto Backend como Front)

**Estrategia**: Supabase **mockeado**. La estructura es casi idéntica a los tests de integración, sólo ampliás los escenarios y detallás más las assertions sobre el JSON de respuesta.

---

## 🟡 Tests que VOS revisás (de otros)

| Test | De quién | Qué verificar |
|------|----------|---------------|
| U2 — `auth.service.register()` | Amir | ¿El mock bloquea la segunda query (el insert)? ¿El mensaje de error es exacto? |
| U5 — `pacientes.service.create()` | Kiara | ¿Las assertions verifican el estado que se pasó al insert, no solo el que devolvió el mock? |
| I2 — `POST /api/pacientes` | Facu | ¿El auth middleware se ejecuta de verdad? ¿El JWT se genera correctamente en el test? |

---

## 🔵 Participación general

- **E2E**: ya decidido — **Supabase mockeado**. Si hay tiempo, Amir agrega el upgrade a BD real.
- **Documentación**: crear `README_TESTS.md` con instrucciones para correr todos los tests
- **Revisión final**: ejecutar `npm test` en el Front y verificar

---

## ⚙️ Setup inicial (para el Front)

```bash
cd Front
npm install --save-dev vitest @vue/test-utils jsdom
```

Agregar en `Front/package.json`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest"
}
```

Agregar en `Front/vite.config.js`:
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
  }
})
```

---

# 📁 Estructura de carpetas que hay que crear

```
Backend/
└── __tests__/
    ├── unit/
    │   ├── auth.service.test.js          ← AMIR (U1 + U2)
    │   ├── derivaciones.service.test.js  ← FACU (U3)
    │   ├── rol.middleware.test.js        ← FACU (U4)
    │   └── pacientes.service.test.js     ← KIARA (U5)
    ├── integration/
    │   ├── auth.integration.test.js      ← AMIR (I1)
    │   ├── pacientes.integration.test.js ← FACU (I2)
    │   └── derivaciones.integration.test.js ← KIARA (I3)
    └── e2e/
        └── pacientes.e2e.test.js         ← KIARA + EVE

Front/
└── src/
    └── __tests__/
        └── Login.test.js                 ← EVE
```

---

# 🔀 Ramas Git

### Estructura de ramas

```
main / develop
    └── test                        ← RAMA BASE (Amir la crea primero)
            ├── test/unitario-auth
            ├── test/unitario-derivaciones
            ├── test/unitario-middleware
            ├── test/unitario-pacientes
            ├── test/integracion-auth
            ├── test/integracion-pacientes
            ├── test/integracion-derivaciones
            ├── test/e2e-pacientes
            └── test/front-login
```

**Reglas**:
- Creá tu rama **desde `test`**, no desde `develop`.
- Mergeá tu rama de vuelta a `test` cuando el test pasa (con PR + revisión cruzada).
- Nadie mergea directamente a `develop`. Amir decide al final si `test` → `develop`.

| Rama | Responsable | No tocar archivos de |
|------|-------------|---------------------|
| `test` (setup inicial) | **Amir** | — |
| `test/unitario-auth` | Amir | archivos de Facu, Kiara |
| `test/unitario-derivaciones` | Facu | archivos de Amir, Kiara |
| `test/unitario-middleware` | Facu | archivos de Amir, Kiara |
| `test/unitario-pacientes` | Kiara | archivos de Amir, Facu |
| `test/integracion-auth` | Amir | — |
| `test/integracion-pacientes` | Facu | — |
| `test/integracion-derivaciones` | Kiara | — |
| `test/e2e-pacientes` | Kiara + Eve | coordinar via PR |
| `test/front-login` | Eve | no toca Backend |

---

# ❓ Decisiones ya tomadas / pendientes

1. **E2E**: **Supabase mockeado** ✅. Si Amir tiene tiempo, puede agregar el upgrade a BD real (`.env.test` + teardown). No bloquea la entrega.

2. **`.env` para tests**: el `JWT_SECRET` que se usa en los tests de integración tiene que estar disponible. Leer el `.env` existente o crear un `.env.test` con un valor de test.

3. **Orden de trabajo**: los unitarios se pueden hacer todos en paralelo desde el primer día. El E2E y el Front también pueden empezar en paralelo.

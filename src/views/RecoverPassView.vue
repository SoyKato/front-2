<!-- src/views/RecoverPassView.vue -->
<template>
  <div class="recover-page">
    <!-- Fondo decorativo -->
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>

    <div class="recover-card">
      <!-- Encabezado -->
      <div class="card-header">
        <span class="card-icon">🔐</span>
        <h1 class="card-title">Recuperar contraseña</h1>
        <p class="card-subtitle">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <!-- Alerta de éxito -->
      <Transition name="alert">
        <div v-if="successMsg" class="alert-success" role="alert">
          <span>✓</span> {{ successMsg }}
        </div>
      </Transition>

      <!-- Alerta de error -->
      <Transition name="alert">
        <div v-if="errorMsg" class="alert-error" role="alert">
          <span>⚠</span> {{ errorMsg }}
        </div>
      </Transition>

      <!-- Formulario -->
      <form class="recover-form" @submit.prevent="handleRecover" novalidate>

        <!-- Campo email -->
        <div class="field" :class="{ 'field--error': errors.email }">
          <label for="email" class="field-label">Correo electrónico</label>
          <div class="field-input-wrap">
            <span class="field-icon">✉</span>
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              class="field-input"
              placeholder="usuario@ejemplo.com"
              autocomplete="email"
              @blur="validateEmail"
            />
          </div>
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <!-- Botón submit -->
        <button
          type="submit"
          class="btn-submit"
          :disabled="isLoading"
          :class="{ 'btn-submit--loading': isLoading }"
        >
          <span v-if="!isLoading">Enviar instrucciones →</span>
          <span v-else class="spinner"></span>
        </button>

        <!-- Link a login -->
        <p class="login-link">
          ¿Recordaste tu contraseña?
          <RouterLink to="/login" class="link">Iniciar sesión</RouterLink>
        </p>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { recoverPassword } = useAuth()

// ── Estado del formulario ──
const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
})

const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// ── Validaciones ──
function validateEmail() {
  if (!form.email) {
    errors.email = 'El correo es obligatorio.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Ingresa un correo válido.'
  } else {
    errors.email = ''
  }
}

function isFormValid() {
  validateEmail()
  return !errors.email
}

// ── Enviar recuperación ──
async function handleRecover() {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (!isFormValid()) return

  isLoading.value = true
  try {
    const result = await recoverPassword(form.email)

    if (!result.ok) {
      errorMsg.value = result.error || 'Error al enviar el correo. Intenta de nuevo.'
      return
    }

    successMsg.value = result.message
    
    // Opcional: redirigir después de 5 segundos
    setTimeout(() => {
      router.push('/login')
    }, 5000)
    
  } catch (error) {
    console.error('Error en recuperación:', error)
    errorMsg.value = 'Error al procesar la solicitud. Por favor, intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ── PÁGINA ── */
.recover-page {
  min-height: calc(100vh - 65px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
}

/* Fondo decorativo */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(200, 169, 110, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 169, 110, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}

.bg-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(200, 169, 110, 0.08) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* ── CARD ── */
.recover-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: rgba(22, 22, 26, 0.95);
  border: 1px solid rgba(200, 169, 110, 0.15);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.03),
    0 24px 48px rgba(0, 0, 0, 0.5);
  animation: cardIn 0.4s ease both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── HEADER ── */
.card-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.card-icon {
  display: block;
  font-size: 2.5rem;
  color: #c8a96e;
  margin-bottom: 0.75rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.card-title {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #e8e4dc, #c8a96e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.4rem;
}

.card-subtitle {
  color: #6b6560;
  font-size: 0.88rem;
  margin: 0;
  line-height: 1.5;
}

/* ── ALERTAS ── */
.alert-error {
  background: rgba(224, 112, 112, 0.1);
  border: 1px solid rgba(224, 112, 112, 0.3);
  color: #e07070;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-size: 0.88rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-success {
  background: rgba(111, 207, 151, 0.1);
  border: 1px solid rgba(111, 207, 151, 0.3);
  color: #6fcf97;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-size: 0.88rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert-enter-active, .alert-leave-active { transition: all 0.3s ease; }
.alert-enter-from, .alert-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── FORMULARIO ── */
.recover-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #9a938c;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 0.85rem;
  font-size: 0.9rem;
  pointer-events: none;
  opacity: 0.5;
}

.field-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 0.65rem 2.75rem 0.65rem 2.5rem;
  color: #e8e4dc;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s, background 0.2s;
  outline: none;
  box-sizing: border-box;
}

.field-input::placeholder { color: #3e3a36; }

.field-input:focus {
  border-color: rgba(200, 169, 110, 0.5);
  background: rgba(200, 169, 110, 0.04);
}

.field--error .field-input {
  border-color: rgba(224, 112, 112, 0.5);
}

.field-error {
  font-size: 0.8rem;
  color: #e07070;
}

/* ── BOTÓN SUBMIT ── */
.btn-submit {
  margin-top: 0.5rem;
  padding: 0.8rem;
  background: linear-gradient(135deg, #c8a96e, #a0834e);
  color: #0d0d0f;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  letter-spacing: 0.01em;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(13, 13, 15, 0.3);
  border-top-color: #0d0d0f;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── LOGIN LINK ── */
.login-link {
  font-size: 0.85rem;
  color: #5a5550;
  text-align: center;
  margin: 0.5rem 0 0;
}

.link {
  color: #c8a96e;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}
</style>
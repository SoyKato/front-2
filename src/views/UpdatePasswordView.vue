<!-- src/views/UpdatePasswordView.vue -->
<template>
  <div class="update-password-page">
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>

    <div class="update-card">
      <div class="card-header">
        <span class="card-icon">🔑</span>
        <h1 class="card-title">Nueva contraseña</h1>
        <p class="card-subtitle">Ingresa tu nueva contraseña</p>
      </div>

      <Transition name="alert">
        <div v-if="successMsg" class="alert-success" role="alert">
          <span>✓</span> {{ successMsg }}
        </div>
      </Transition>

      <Transition name="alert">
        <div v-if="errorMsg" class="alert-error" role="alert">
          <span>⚠</span> {{ errorMsg }}
        </div>
      </Transition>

      <form class="update-form" @submit.prevent="handleUpdatePassword" novalidate>

        <div class="field" :class="{ 'field--error': errors.password }">
          <label for="password" class="field-label">Nueva contraseña</label>
          <div class="field-input-wrap">
            <span class="field-icon">🔑</span>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              placeholder="Mínimo 6 caracteres"
              @blur="validatePassword"
            />
            <button
              type="button"
              class="field-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <div class="field" :class="{ 'field--error': errors.confirm }">
          <label for="confirm" class="field-label">Confirmar contraseña</label>
          <div class="field-input-wrap">
            <span class="field-icon">🔒</span>
            <input
              id="confirm"
              v-model="form.confirm"
              :type="showConfirm ? 'text' : 'password'"
              class="field-input"
              placeholder="Repite tu nueva contraseña"
              @blur="validateConfirm"
            />
            <button
              type="button"
              class="field-toggle"
              @click="showConfirm = !showConfirm"
            >
              {{ showConfirm ? '🙈' : '👁' }}
            </button>
          </div>
          <span v-if="errors.confirm" class="field-error">{{ errors.confirm }}</span>
        </div>

        <button
          type="submit"
          class="btn-submit"
          :disabled="isLoading"
          :class="{ 'btn-submit--loading': isLoading }"
        >
          <span v-if="!isLoading">Actualizar contraseña →</span>
          <span v-else class="spinner"></span>
        </button>

        <p class="login-link">
          <RouterLink to="/login" class="link">Volver al inicio de sesión</RouterLink>
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
const { updatePassword } = useAuth()

const form = reactive({
  password: '',
  confirm: ''
})

const errors = reactive({
  password: '',
  confirm: ''
})

const showPassword = ref(false)
const showConfirm = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

function validatePassword() {
  if (!form.password) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (form.password.length < 6) {
    errors.password = 'Mínimo 6 caracteres.'
  } else {
    errors.password = ''
  }
}

function validateConfirm() {
  if (!form.confirm) {
    errors.confirm = 'Confirma tu contraseña.'
  } else if (form.confirm !== form.password) {
    errors.confirm = 'Las contraseñas no coinciden.'
  } else {
    errors.confirm = ''
  }
}

function isFormValid() {
  validatePassword()
  validateConfirm()
  return !errors.password && !errors.confirm
}

async function handleUpdatePassword() {
  errorMsg.value = ''
  successMsg.value = ''
  
  if (!isFormValid()) return

  isLoading.value = true
  try {
    const result = await updatePassword(form.password)

    if (!result.ok) {
      errorMsg.value = result.error || 'Error al actualizar la contraseña.'
      return
    }

    successMsg.value = result.message
    
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
  } catch (error) {
    console.error('Error actualizando contraseña:', error)
    errorMsg.value = 'Error al procesar la solicitud.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.update-password-page {
  min-height: calc(100vh - 65px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem 1rem;
}

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

.update-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: rgba(22, 22, 26, 0.95);
  border: 1px solid rgba(200, 169, 110, 0.15);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.5);
  animation: cardIn 0.4s ease both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.card-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.card-icon {
  display: block;
  font-size: 2.5rem;
  color: #c8a96e;
  margin-bottom: 0.75rem;
}

.card-title {
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #e8e4dc, #c8a96e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.4rem;
}

.card-subtitle {
  color: #6b6560;
  font-size: 0.88rem;
  margin: 0;
}

.alert-error {
  background: rgba(224,112,112,0.1);
  border: 1px solid rgba(224,112,112,0.3);
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
  background: rgba(111,207,151,0.1);
  border: 1px solid rgba(111,207,151,0.3);
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

.update-form {
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
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
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
  border-color: rgba(200,169,110,0.5);
  background: rgba(200,169,110,0.04);
}

.field--error .field-input {
  border-color: rgba(224,112,112,0.5);
}

.field-error {
  font-size: 0.8rem;
  color: #e07070;
}

.field-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  opacity: 0.6;
  transition: opacity 0.2s;
  padding: 0;
}

.field-toggle:hover { opacity: 1; }

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
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(13,13,15,0.3);
  border-top-color: #0d0d0f;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

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
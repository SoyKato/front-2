// src/composables/useAuth.js
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

// Estado GLOBAL compartido
const _user = ref(null)
const _token = ref(localStorage.getItem('auth_token') || null)

export function useAuth() {
  const isAuthenticated = computed(() => !!_token.value)
  const user = computed(() => _user.value)

  function setAuthState(userData, token) {
    _user.value = userData
    _token.value = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  async function login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      const { data: userData } = await supabase
        .from('registrousuarios')
        .select('nombre')
        .eq('id', data.user.id)
        .maybeSingle()

      const userInfo = {
        id: data.user.id,
        email: data.user.email,
        name: userData?.nombre || data.user.user_metadata?.nombre
      }

      setAuthState(userInfo, data.session.access_token)
      return { ok: true, user: userInfo }
    } catch (error) {
      console.error('Error en login:', error)
      return { ok: false, error: error.message }
    }
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setAuthState(null, null)
      return { ok: true }
    } catch (error) {
      console.error('Error en logout:', error)
      return { ok: false, error: error.message }
    }
  }

  async function authenticate(email, password) {
    const result = await login(email, password)
    return result.ok ? result.user : null
  }

  async function register(name, email, password) {
    try {
      console.log('📝 Intentando registrar:', { name, email })
      
      // 1. Verificar si el email ya existe en la tabla
      const { data: existingUser } = await supabase
        .from('registrousuarios')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        console.log('❌ Email ya registrado en la tabla')
        return { ok: false, error: 'Este correo electrónico ya está registrado' }
      }

      // 2. Registrar en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: name
          }
        }
      })

      if (authError) {
        console.error('❌ Error en Auth:', authError)
        // Si el error es que el usuario ya existe
        if (authError.message.includes('already registered')) {
          return { ok: false, error: 'Este correo electrónico ya está registrado' }
        }
        return { ok: false, error: authError.message }
      }

      if (!authData.user) {
        console.error('❌ No se creó el usuario')
        return { ok: false, error: 'No se pudo crear el usuario' }
      }

      console.log('✅ Usuario creado en Auth:', authData.user.id)

      // 3. Guardar en la tabla registrousuarios
      const { error: dbError } = await supabase
        .from('registrousuarios')
        .insert([
          {
            id: authData.user.id,
            email: email,
            nombre: name,
            created_at: new Date().toISOString()
          }
        ])

      if (dbError) {
        console.error('❌ Error al guardar en DB:', dbError)
        // Si hay error en DB, intentamos limpiar el usuario de Auth
        // Nota: Supabase no tiene una función directa para eliminar usuarios desde cliente
        return { ok: false, error: 'Error al guardar datos del usuario. Por favor intenta de nuevo.' }
      }

      console.log('✅ Usuario guardado en DB exitosamente')

      // 4. Iniciar sesión automáticamente después del registro
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (!loginError && loginData?.session) {
        const userInfo = {
          id: loginData.user.id,
          email: loginData.user.email,
          name: name
        }
        setAuthState(userInfo, loginData.session.access_token)
        return { 
          ok: true, 
          user: userInfo,
          message: 'Usuario registrado exitosamente'
        }
      }

      return { 
        ok: true, 
        user: { 
          id: authData.user.id, 
          email, 
          name 
        },
        message: 'Usuario registrado exitosamente. Por favor inicia sesión.'
      }
    } catch (error) {
      console.error('❌ Error en registro:', error)
      return { ok: false, error: error.message || 'Error al registrar usuario' }
    }
  }

  async function emailExists(email) {
    try {
      if (!email || email.trim() === '') {
        return false
      }

      const { data, error } = await supabase
        .from('registrousuarios')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      // Si hay error, asumimos que el email NO existe (para no bloquear)
      if (error) {
        console.warn('⚠️ Error verificando email:', error)
        return false
      }
      
      return !!data
    } catch (error) {
      console.error('❌ Error verificando email:', error)
      return false
    }
  }

  async function getCurrentUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: userData } = await supabase
          .from('registrousuarios')
          .select('nombre')
          .eq('id', session.user.id)
          .maybeSingle()
          
        const userInfo = {
          id: session.user.id,
          email: session.user.email,
          name: userData?.nombre || session.user.user_metadata?.nombre
        }
        
        setAuthState(userInfo, session.access_token)
        return userInfo
      }
      
      return null
    } catch (error) {
      console.error('❌ Error obteniendo usuario:', error)
      return null
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    authenticate,
    register,
    emailExists,
    getCurrentUser
  }
}
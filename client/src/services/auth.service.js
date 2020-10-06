import axios from 'axios'

const AUTH_API_URL = 'http://localhost:8000/auth/'
const SIGNUP_URL = 'http://localhost:8000/users/signup/'

const register = (email, password) => {
  return axios.post(SIGNUP_URL, {
    email,
    password
  })
}

const signin = (email, password) => {
  const params = new URLSearchParams()
  params.append('username', email)
  params.append('password', password)
  return axios
    .post(AUTH_API_URL + 'token', params)
    .then((response) => {
      if (response.data.access_token) {
        localStorage.setItem('user', JSON.stringify(response.data))
      }

      return response.data
    })
}

const logout = () => {
  localStorage.removeItem('user')
  return axios.get(AUTH_API_URL + 'logout')
}

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'))
}

const authHeader = () => {
  const user = getCurrentUser()
  if (user && user.access_token) {
    return { Authorization: 'Bearer ' + user.access_token }
  }

  return {}
}

const isAuthenticated = () => {
  const user = getCurrentUser()
  return user && user.access_token
}

export default {
  register,
  signin,
  logout,
  getCurrentUser,
  authHeader,
  isAuthenticated
}

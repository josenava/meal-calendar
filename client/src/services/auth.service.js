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
  // TODO api call to delete token in the server
  localStorage.removeItem('user')
}

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'))
}

export default {
  register,
  signin,
  logout,
  getCurrentUser
}

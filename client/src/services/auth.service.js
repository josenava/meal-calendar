import axios from 'axios'

const AUTH_API_URL = 'http://localhost:8000/auth/'
const SIGNUP_URL = 'http://localhost:8000/users/signup/'

const register = (email, password) => {
  return axios.post(SIGNUP_URL, {
    email,
    password
  })
}

const login = (username, password) => {
  return axios
    .post(AUTH_API_URL + 'signin', {
      username,
      password
    })
    .then((response) => {
      if (response.data.accessToken) {
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
  login,
  logout,
  getCurrentUser
}

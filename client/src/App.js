import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './components/Signup/Signup'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'

function App () {
  return (
    <Router>
      <Switch>
        <Route exact={true} path="/">
          <Home/>
        </Route>
        <Route path="/signup">
          <Signup />
        </Route>
      </Switch>
    </Router>
  )
}

function Home () {
  return (
    <div className="App">
      <p><Link to="/signup">Signup here</Link></p>
    </div>
  )
}

export default App

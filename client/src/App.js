import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './components/Signup/Signup'
import Signin from './components/Signin/Signin'
import MealCalendar from './components/MealCalendar/MealCalendar'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact={true} path="/" component={Home} />
        <Route path="/signup" component={Signup} />
        <Route path="/meals" component={MealCalendar} />
      </Switch>
    </Router>
  )
}

const Home = (props) => {
  return (
    <div className="App">
      <Signin {...props} />
      <p><Link to="/signup">Signup here</Link></p>
    </div>
  )
}

export default App

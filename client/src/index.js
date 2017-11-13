import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import ReactForm from './ReactForm'
import Calendar from './Calendar'
import Menu from './Menu'
window.React = require('react')

//import registerServiceWorker from './registerServiceWorker'

//ReactDOM.render(<App />, document.getElementById('root'))
ReactDOM.render(<Menu/>, document.getElementById('tabs'))
//ReactDOM.render(<ReactForm name='formName' />, document.getElementById('formElement'))
//ReactDOM.render(<Calendar name='calendarName' />, document.getElementById('calendarElement'))

//registerServiceWorker()

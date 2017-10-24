import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import ReactForm from './ReactForm'
import Calendar from './Calendar'
//import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
ReactDOM.render(<ReactForm name='formName' />, document.getElementById('formElement'))
ReactDOM.render(<Calendar name='calendarName' />, document.getElementById('calendarElement'))

//registerServiceWorker()

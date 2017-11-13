import React, { Component} from 'react'
import BigCalendar from 'react-big-calendar'
import Modal from 'react-awesome-modal'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import moment from 'moment'



let allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k])
BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
)

class Calendar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      events: [],
      selectedEvent: {},
      visible: false
    }
  }

  formatDate (date) {
    return moment(date).format('dddd, MMMM Do YYYY, h:mm:ss a')
  }

  handleClick (selectedEvent) {
    this.setState({visible: true})
    this.setState({selectedEvent})
  }

  handleClose () {
    this.setState({visible: false})
  }

  render () {
    return (
      <div>
        <Modal
          visible={this.state.visible}
          width="400"
          height="400"
          onClickAway={() => this.handleClose()}
        >
          <h1> {this.state.selectedEvent.title}</h1>
          <p>Start: {this.formatDate(this.state.selectedEvent.start)}</p>
          <p>End: {this.formatDate(this.state.selectedEvent.end)}</p>
          <p>Description: {this.state.selectedEvent.desc}</p>
        </Modal>

        <BigCalendar
          selectable
          onSelectEvent={event => this.handleClick(event)}
          events={this.state.events}
          views={allViews}
          step={60}
          defaultDate={new Date()}
          style={{height: '90vh'}}
        />
      </div>
    )
  }

  componentDidMount () {
    this.getData()
  }

  getData () {
    return fetch('/api/v1/tasks?calendar=true')
    .then((response) => response.json())
    .then((events) => {
      console.error('SUCCESS: ', events)
      this.setState({events})
    })
    .catch((err) => {
      console.error('Error Occured: ', err)
    })
  }
}

export default Calendar

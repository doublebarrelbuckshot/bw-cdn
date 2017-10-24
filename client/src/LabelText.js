import React, { Component } from 'react'
import './App.css'

class LabelText extends Component {
  constructor (props) {
    super(props)
    this.props = props
    this.name = props.name
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    const data = event.target.value
    const name = event.target.name
    this.props.onChange(name, data)
  }

  render () {
    return (
      <div>
        <label htmlFor={'text' + this.name}>{this.name}</label>
        <input id={'text' + this.name} type='text' name={this.name} onChange={this.handleChange} />
      </div>
    )
  }
}

export default LabelText

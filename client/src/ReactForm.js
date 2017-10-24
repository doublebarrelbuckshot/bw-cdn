import React, { Component } from 'react'
import './App.css'
import LabelText from './LabelText'

class ReactForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filePath: '',
      task: '',
      description: ''
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleFileUpload = this.handleFileUpload.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange (name, data) {
    let obj = {}
    obj[name] = data

    this.setState(obj)
  }

  handleFileUpload (event) {
    const file = event.target.files[0]
    this.setState({file: file})
  }

  /**
   * POST form data to server
   * @param  {Event}
   * @return {Promise}
   */
  handleSubmit (event) {
    event.preventDefault()
    let data = new FormData()
    data.append('file', this.state.file)
    const options = {
      method: 'POST',
      body: data
    }

    return fetch('http://localhost:2999/api/v1/assetx/111test2', options)
    // .then(function (response) {
    //   return response.json()
    // })
    .then(function (json) {
      console.error('SUCCESS: ', json)
      alert('Uploaded Successfully')
    })
    .catch(function (err) {
      console.error('Error Occured: ', err)
      alert('Error occured during upload')
    })
  }

  render () {
    const change = this.handleChange
    const fields = Object.keys(this.state)
    const textFields = fields.filter(function (f) {
      return f !== 'file'
    })
    return (
      <form onSubmit={this.handleSubmit}>
        <input type='submit' value='Submit' />
        {
          textFields.map(function (field) {
            const props = {
              name: field,
              onChange: change
            }
            return <LabelText {...props} />
          })
        }
        <label name='FileToUpload'>File: </label>
        <input ref="file" type="file" name="file" onChange={this.handleFileUpload}/>
      </form>
    )
  }
}

export default ReactForm

import { render } from 'react-dom'
import React, { Component, PropTypes } from 'react'
import SimpleTab from 'react-simple-tab'
import ReactForm from './ReactForm'

import Calendar from './Calendar'

const Styles = {
  tabContent: {
    border: 'solid 2px #ebeced',
    padding: '15px'
  },
  app: {
    tabStyle: {
      fontSize: '20px'
    },
    labelListStyle: {
      margin: 0,
      padding: 0,
      bottom: '-2px',
      position: 'relative'
    },
    tabContentStyle: {
      padding: '10px'
    },
    activeTabContentStyle: {
      borderWidth: '4px 2px 0px 2px',
      borderColor: '#ff6c60 #ebeced transparent #ebeced',
      borderStyle: 'solid',
      zIndex: 1,
      background: 'white',
      fontWeight: 'bold'
    }
  }
};

class TabContent extends Component {
  render() {
    return (
      <div style={Styles.tabContent}>
        {this.props.children}
      </div>
    );
  }
}

class App extends Component {
  render () {
    const tabs = [
      { title: 'Calendar', content: (<Calendar name='calendarName' />) },
      { title: 'Add File', content: (<ReactForm name='formName' />) }
    ].map(tab => {
      return Object.assign({}, tab, {
        style: Styles.app.tabContentStyle,
        activeStyle: Styles.app.activeTabContentStyle
      });
    });

    return (
      <SimpleTab
        tabs={tabs}
        style={Styles.app.tabStyle}
        labelListStyle={Styles.app.labelListStyle}/>
    );
  }
}
export default App



//import 'bootstrap/dist/css/bootstrap.min.css';
// import contStyles from './index.scss';
import './global.css';

import React, { Component, PropTypes } from 'react'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();


// стили для react-virtualized-grid
import 'react-virtualized/styles.css'

// стили MuiTheme для material-ui
import MuiThemeProvider, { styles, muiTheme } from './MuiTheme';

import db from './metadata/pouchdb'

import HomeView from './HomeView'

export default class AppContainer extends Component {

	static childContextTypes = {
		db: React.PropTypes.object.isRequired
	};

	getChildContext() {
		return {db: db};
	}

  render() {
    return (
    <MuiThemeProvider muiTheme={muiTheme}>
	    <div style={ styles.container }>
		    <HomeView />
	    </div>
    </MuiThemeProvider>
    )
  }
}

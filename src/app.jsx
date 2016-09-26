
//import 'bootstrap/dist/css/bootstrap.min.css';
// import contStyles from './index.scss';
import './global.css';

import React, { Component, PropTypes } from 'react'


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

	// // вызывается один раз на клиенте и сервере при подготовке компонента
	// componentWillMount() {
	//
	// 	// инициализируем параметры сеанса и метаданные
	// 	$p.wsql.init(settings, meta_init);
	//
	// 	// подключаем обработчики событий плагином metadata-redux
	// 	// $p.rx_events(this.props.store);
	//
	// 	// информируем хранилище о готовности MetaEngine
	// 	// this.props.store.dispatch($p.rx_actions.META_LOADED($p))
	//
	// 	// читаем локальные данные в ОЗУ
	// 	return $p.adapters.pouch.load_data();
	//
	// }

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

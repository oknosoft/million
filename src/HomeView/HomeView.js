/** @flow */
import React, {Component, PropTypes} from "react";
import {InfiniteLoader, AutoSizer, List, Grid} from "react-virtualized";
import styles from "./HomeView.scss";
import TextField from "material-ui/TextField";
import cn from "classnames";


const limit = 30,
  totalRows = 999999;

let timer = 0;

const list = {
  _data: [],
  get size(){ return this._data.length},
  get(index){ return this._data[index]},
  clear(){this._data.length = 0}
}

function pad(num, size) {
	var s = String(num);
	while (s.length < (size || 2)) {
		s = "0" + s;
	}
	return s;
}

export default class InfiniteLoaderExample extends Component {

	static contextTypes = {
		db: React.PropTypes.object.isRequired
  };

  constructor (props) {

    super(props);

    this.state = {
      totalRowCount: 1,
      filter: {id: 0, name: ''},
	    infoReceived: false
    }

    this._isRowLoaded = ::this._isRowLoaded
    this._loadMoreRows = ::this._loadMoreRows
    this._rowRenderer = ::this._rowRenderer
    this._cellRenderer = ::this._cellRenderer
    this._on_by_id = ::this._on_by_id
    this._on_by_name = ::this._on_by_name

  }

  render () {

    const { totalRowCount } = this.state

    return (
      <div style={{height: '100%'}}>

	      <div style={{height: '72px'}}>
		      <TextField
			      ref='id'
			      hintText='№'
			      floatingLabelText='К строке'
			      floatingLabelFixed={true}
			      style={{width: '90px'}}
			      onChange={this._on_by_id}
		      />
		      <TextField
			      ref='name'
			      hintText='Начальные символы'
			      floatingLabelText='Фильтр по названию'
			      floatingLabelFixed={true}
			      style={{width: '270px'}}
			      onChange={this._on_by_name}
		      />
	      </div>

	      <AutoSizer >

		      {({width, height}) => (
			      //disableHeight

			      <InfiniteLoader
				      ref='infinit'
				      isRowLoaded={this._isRowLoaded}
				      loadMoreRows={this._loadMoreRows}
				      rowCount={totalRowCount}
				      minimumBatchSize={limit}
			      >
				      {({onRowsRendered, registerChild}) => {

					      const onSectionRendered = ({rowOverscanStartIndex, rowOverscanStopIndex, rowStartIndex, rowStopIndex}) => {

						      onRowsRendered({
							      overscanStartIndex: rowOverscanStartIndex,
							      overscanStopIndex: rowOverscanStopIndex,
							      startIndex: rowStartIndex,
							      stopIndex: rowStopIndex
						      })
					      }

					      return (


						      <Grid
							      ref={registerChild}
							      className={styles.BodyGrid}
							      onSectionRendered={onSectionRendered}
							      cellRenderer={this._cellRenderer}
							      columnCount={2}
							      columnWidth={({index}) => index ? 270 : 90 }
							      rowCount={totalRowCount}
							      rowHeight={30}
							      width={width}
							      height={height-72}
						      />

						      /*
						       <List
						       ref={registerChild}
						       className={styles.List}
						       height={300}
						       onRowsRendered={onSectionRendered}
						       rowCount={totalRowCount}
						       rowHeight={30}
						       rowRenderer={this._rowRenderer}
						       scrollToIndex={scrollToRow}
						       width={width}
						       />
						       */

					      )
				      }

				      }

			      </InfiniteLoader>

		      )}
	      </AutoSizer>

      </div>
    )
  }

  _on_by_id (event) {

    if(timer){
      clearTimeout(timer)
    }

    let id_value = Math.min(totalRows, parseInt(event.target.value, 10))

    if (isNaN(id_value)) {
      id_value = undefined
    }

    const new_state = {
      filter: {id: id_value, name: ''},
	    totalRowCount: this.state.totalRowCount <= 1 ? 2 : 1
    }
    timer = setTimeout(() =>{
	    list.clear()
	    this.refs.name.input.value = ''
      this.setState(new_state)
    }, 600)
  }

  _on_by_name (event) {

    if(timer){
      clearTimeout(timer)
    }

    const new_state = {
      filter: {id: '', name: event.target.value},
      totalRowCount: this.state.totalRowCount <= 1 ? 2 : 1
    }
    timer = setTimeout(() =>{
	    list.clear()
	    this.refs.id.input.value = ''
      this.setState(new_state)
    }, 600)

  }

  _isRowLoaded ({ index }) {
  	const res = !!list.get(index)
    return res
  }

  _getRowClassName (row) {
    return row % 2 === 0 ? styles.evenRow : styles.oddRow
  }

  _loadMoreRows ({ startIndex, stopIndex }) {

    const { filter, infoReceived, totalRowCount } = this.state
	  const { db } = this.context
    const increment = Math.max(limit, stopIndex - startIndex + 1)

	  // готовим фильтры для запроса couchdb
	  let fun = 'doc/by_id';
    const select = {
    	include_docs: true,
      skip: startIndex,
	    limit: increment
    }
    if(filter.name){
	    fun = 'doc/by_name'
      Object.assign(select, {
	      startkey: filter.name,
	      endkey: filter.name + '\uffff'
      })
    }else{
      Object.assign(select, {
	      startkey: pad(parseInt(filter.id) || 0, 9),
	      endkey: pad(parseInt(filter.id+999) || 0, 9)
      })
    }

    // если к базе еще не обращались - получим info()
	  return (infoReceived ? Promise.resolve() : db.info().then(() => {this.setState({ infoReceived: true })}))
		  .then(() => {

		  	// выполняем запрос
			  db.query(fun, select)
				  .then((data) => {

				  	// обновляем массив результата
					  for (var i = 0; i < data.rows.length; i++) {
						  if(!list._data[i+startIndex]){
							  list._data[i+startIndex] = data.rows[i].doc;
						  }
					  }

					  // обновляем состояние - изменилось количество записей
					  if(totalRowCount != startIndex + data.rows.length + (data.rows.length < increment ? 0 : increment )){
						  this.setState({
							  totalRowCount: startIndex + data.rows.length + (data.rows.length < increment ? 0 : increment )
						  })
					  }else{
						  this.refs.infinit.forceUpdate()
					  }

				  })
		  })
  }

  _rowRenderer ({ index, key, style }) {

    const rowClass = this._getRowClassName(index)
    const classNames = cn(rowClass, styles.cell, {
      [styles.centeredCell]: columnIndex > 2
    })

    const row = list.get(index)
    let content

    if (row) {
      content = row.id + ': ' + row.name
    } else {
      content = (
        <div
          className={styles.placeholder}
          style={{ width: 10 + Math.random() * 80 }}
        />
      )
    }

    return (
      <div
        className={classNames}
        key={key}
        style={style}
      >
        {content}
      </div>
    )
  }

  _cellRenderer ({
    columnIndex, // Horizontal (column) index of cell
    isScrolling, // The Grid is currently being scrolled
    key,         // Unique key within array of cells
    rowIndex,    // Vertical (row) index of cell
    style        // Style object to be applied to cell
  }) {

    const setState = ::this.setState
    // var grid = this.refs.AutoSizer.refs.Grid

    const rowClass = this._getRowClassName(rowIndex)
    const classNames = cn(
      rowClass,
      styles.cell,
      {
        [styles.centeredCell]: columnIndex > 2
      },
      (rowIndex === this.state.hoveredRowIndex // || columnIndex === this.state.hoveredColumnIndex
        ? styles.hoveredItem
        : '')
      )

    const row = list.get(rowIndex)

    let content

    if (row) {
      content = columnIndex == 0 ? row.id : row.name
    } else {
      content = (
        <div
          className={styles.placeholder}
          style={{ width: 10 + Math.random() * 80 }}
        />
      )
    }

    // It is important to attach the style specified as it controls the cell's position.
    // You can add additional class names or style properties as you would like.
    // Key is also required by React to more efficiently manage the array of cells.
    return (
      <div
        className={classNames}
        key={key}
        style={style}
        onMouseOver={function () {
          setState({
            hoveredColumnIndex: columnIndex,
            hoveredRowIndex: rowIndex
          })
        }}
      >
        {content}
      </div>
    )
  }
}

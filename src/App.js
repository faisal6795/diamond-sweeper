import React, { Component } from 'react';
import './styles/App.css';
import TableItem from './tableItem';

const SIZE = 8;
export default class App extends Component {
	diamondPositions = [
		{ r: Math.floor(Math.random() * SIZE), c: Math.floor(Math.random() * SIZE) }
	];
	refItems = [];
	state = { gameOver: false, foundAllDiamond: false, score: SIZE * SIZE };

	componentWillMount() {
		while (this.diamondPositions.length < SIZE) {
			const r = Math.floor(Math.random() * SIZE);
			const c = Math.floor(Math.random() * SIZE);
			if (this.diamondPositions.findIndex(pos => pos.r === r && pos.c === c) === -1) {
				this.diamondPositions.push({ r, c });
			}
		}
	}

	_decrementCounter(row, col) {
		this.refItems.forEach(refItem => {
			if (refItem.row !== row && refItem.col !== col) {
				refItem.ref._resetCurrentTile();
			}
		});

		this.setState({ score: this.state.score - 1 < 0 ? 0 : this.state.score - 1 });
		if (this.state.score === 0) {
			this.setState({ gameOver: true });
			const prevScore = localStorage.getItem('highScore') || 0;
			if (prevScore < this.state.score)
				localStorage.setItem('highScore', this.state.score - 1);
		}
	}

	_reload() {
		window.location.reload();
	}

	_removeRevealedDiamondFromSearchArray(row, col) {
		this.diamondPositions.splice(
			this.diamondPositions.findIndex(diamond => diamond.r === row && diamond.c === col), 1
		);
		if (this.diamondPositions.length === 0) {
			this.setState({ foundAllDiamond: true });
			const prevScore = localStorage.getItem('highScore') || 0;
			if (prevScore < this.state.score)
				localStorage.setItem('highScore', this.state.score - 1);
		}
	}

	_renderRowElements(row) {
		let rowElements = [];
		for (let i = 0; i < SIZE; i++) {
			rowElements.push(
				<td key={i + '' + row}>
					<TableItem
						ref={ref => {
							if (this.refItems.length < SIZE * SIZE)
								this.refItems.push({ row: row, col: i, ref });
						}}
						row={row}
						col={i}
						diamondPositions={this.diamondPositions}
						removeDiamondFromArray={() =>
							this._removeRevealedDiamondFromSearchArray(row, i)
						}
						decrementCounter={() => this._decrementCounter(row, i)}
					/>
				</td>
			);
		}
		return rowElements;
	}

	_renderRows() {
		let row = [];
		for (let i = 0; i < SIZE; i++) {
			row.push(<tr key={i}>{this._renderRowElements(i)}</tr>);
		}
		return row;
	}

	_renderTable() {
		return (
			<React.Fragment>
				<div className="score-board">
					<p className="score-text">Highscore: {localStorage.getItem('highScore') || 0}</p>
					<p className="score-text">Diamonds Left: {this.diamondPositions.length}</p>
					<p className="score-text">Your score: {this.state.score}</p>
				</div>
				<table className="table-board">
					<tbody>{this._renderRows()}</tbody>
				</table>
			</React.Fragment>
		);
	}

	_renderGameOver() {
		return (
			<div className="game-over-content">
				<span className="game-over-text">
					{this.state.gameOver
						? `Game Over`
						: `Congratulations! You have found all the diamonds.`}
				</span>
				<p className="score-text-game-over">Your score: {this.state.score}</p>
				<button onClick={this._reload}>Play again</button>
			</div>
		);
	}

	render() {
		const description = "Find all the hidden diamonds behind some tiles of this board in the lowest moves possible. Make high scores and challenge your friends as well.";
		return (
			<React.Fragment>
				<div className='heading'>
					<h1>Diamond Sweeper</h1>
					<p>{description}</p>
				</div>
				<div>
					{this.state.gameOver || this.state.foundAllDiamond ?
						this._renderGameOver() : this._renderTable()}
				</div>
			</React.Fragment>
		);
	}
}
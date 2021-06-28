import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const BOARD_SIZE = 8;
const dx = [1, 1, 0, -1, -1, -1, 0, 1], dy = [0, 1, 1, 1, 0, -1, -1, -1]; //周囲8マス
//石の色
const color = {
    false: "black",
    true: "white",
    null: "green"
};

//マス
function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            <div class="circle" style={{ background: color[props.value] }} />
        </button >
    );
}

//盤面
class Board extends React.Component {
    //初期盤面
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null)),
            player: false,
        };
        this.state.squares[BOARD_SIZE / 2 - 1][BOARD_SIZE / 2 - 1] = this.state.squares[BOARD_SIZE / 2][BOARD_SIZE / 2] = true;
        this.state.squares[BOARD_SIZE / 2 - 1][BOARD_SIZE / 2] = this.state.squares[BOARD_SIZE / 2][BOARD_SIZE / 2 - 1] = false;
    }

    //マス(i,j)をクリックしたときの処理
    handleClick(i, j) {
        //終了状態でなく、おけるマスがない場合はパス
        if (!this.isTerminal() && !this.canMove(this.state.player)) this.pass();
        //終了状態 または、選択したマスに置けない場合は何もせずreturn
        if (this.isTerminal() || !this.canPut(i, j, this.state.player)) {
            return;
        }
        //マス(i,j)に石をおいて手番を進める
        this.put(i, j);
    }

    //マス(i,j)の描画
    renderSquare(i, j) {
        return (
            <Square
                value={this.state.squares[i][j]}
                onClick={() => this.handleClick(i, j)}
            />
        );
    }
    //ゲームの状態(次の手番、石の数、勝利者)を取得
    getStatus() {
        let next_player = 'Next player: ' + (this.state.player ? "Second" : "First");
        let count = this.countDisks();
        let first_count = 'First: ' + count[0];
        let second_count = 'Second: ' + count[1];
        if (this.isTerminal()) {
            let winner;
            if (count[0] > count[1]) winner = "Winner: First";
            else if (count[0] < count[1]) winner = "Winner: Second";
            else winner = "Draw";
            return (
                <div className="status">
                    {winner}<br></br>
                    {first_count}<br></br>
                    {second_count}
                </div>
            );
        }
        else {
            return (
                <div className="status">
                    {next_player} <br></br>
                    {first_count}<br></br>
                    {second_count}
                </div>
            );
        }

    }

    //Square要素を8×8個生成して描画
    render() {
        return (
            <div>
                {this.getStatus()}
                {
                    Array(BOARD_SIZE).fill(null).map((val, i) => {
                        return (
                            <div className="board-row">
                                {
                                    Array(BOARD_SIZE).fill(null).map((val, j) => {
                                        return this.renderSquare(i, j);
                                    })
                                }
                            </div>
                        );
                    })
                }
            </div>
        );
    }
    //マス(i,j)が盤面の内部に存在するか
    isInside(i, j) {
        return i >= 0 && i < BOARD_SIZE && j >= 0 && j <= BOARD_SIZE;
    }
    //playerが石を置けるマスが存在するか
    canMove(player) {
        for (let i = 0; i < BOARD_SIZE; i++)for (let j = 0; j < BOARD_SIZE; j++) {
            if (this.canPut(i, j, player)) return true;
        }
        return false;
    }
    //playerがマス(i,j)に石をおけるか
    canPut(i, j, player) {
        const squares = this.state.squares.slice();
        if (squares[i][j] != null) return false; //マス(i,j)は空きマスでなければならない
        for (let dir = 0; dir < 8; dir++) {
            let nx = i + dx[dir];
            let ny = j + dy[dir];
            if (!this.isInside(nx, ny)) continue;
            if (squares[nx][ny] != (!player)) continue; //隣接したマスに相手の石が置かれていなければならない
            for (let k = 0; k < BOARD_SIZE; k++) {
                nx += dx[dir];
                ny += dy[dir];
                if (!this.isInside(nx, ny)) break;
                if (squares[nx][ny] == null) break;
                if (squares[nx][ny] == player) return true;
            }
        }
        return false;
    }
    //終了状態の判定
    isTerminal() {
        return !this.canMove(false) && !this.canMove(true);
    }
    //(i,j)に石を置く
    put(i, j) {
        let squares = this.state.squares.slice();
        let player = this.state.player;
        squares[i][j] = player;
        for (let dir = 0; dir < 8; dir++) {
            let nx = i + dx[dir], ny = j + dy[dir];
            if (!this.isInside(nx, ny)) continue;
            if (squares[nx][ny] != (!player)) continue;
            for (let k = 0; k < BOARD_SIZE; k++) {
                nx += dx[dir];
                ny += dy[dir];
                if (!this.isInside(nx, ny)) break;     //はみ出たらアウト
                if (squares[nx][ny] == '.') break;  //空きマスでもアウト

                // i,jからnx,nyまで全部ひっくり返す
                if (squares[nx][ny] == player) {
                    let x = i + dx[dir], y = j + dy[dir];
                    while (x != nx || y != ny) {
                        squares[x][y] = player;  //ひっくり返す
                        x += dx[dir];
                        y += dy[dir];
                    }
                    break;
                }
            }
        }
        this.setState({
            squares: squares,
            player: !this.state.player,
        });
    }
    //手番を渡す処理
    pass() {
        this.setState({
            player: !this.state.player,
        });
    }
    //石の個数をカウント
    countDisks() {
        let ret = [0, 0];
        for (let i = 0; i < BOARD_SIZE; i++)for (let j = 0; j < BOARD_SIZE; j++) {
            if (this.state.squares[i][j] == true) ret[1] += 1;
            else if (this.state.squares[i][j] == false) ret[0] += 1;
        }
        return ret;
    }

}

class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

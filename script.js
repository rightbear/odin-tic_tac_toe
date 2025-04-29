/*
** A Cell represents one "square" on the board and can have one of
** 0: no content is in the square,
** 1: Player One's value -> 'O',
** 2: Player 2's value -> 'X'
*/

function Cell() {
    let value = 0;
  
    // Accept a player's value to change the content of the cell
    const changeCell = (player) => {
      value = player;
    };
  
    // Retrieve the current value of this cell through closure
    const getValue = () => value;
  
    return {
      changeCell,
      getValue
    };
}

/*
** The Gameboard represents the state of the board
** Each equare holds a Cell (defined later)
** and we expose a drawCell method to be able to change content in Cells
*/

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    // Create a 2d array that will represent the state of the game board
    // For this 2d array, row 0 will represent the top row and
    // column 0 will represent the left-most column.
    // This nested-loop technique is a simple and common way to create a 2d array.
    for(let i = 0 ; i < rows ; i++){
        board[i] = [];
        for(let j = 0 ; j < columns ; j++){
            board[i].push(Cell())
        }
    }

    // This will be the method of getting the entire board that our
    // UI will eventually need to render it.
    const getBoard = () => board;
    
    // In order to chage content of cell, we need to find what the current contenet 
    // in cell is, *then* change that cell's content baesd on player's value 
    const drawCell = (row, column, player) =>  {
        const currentCell = board[row][column];

        if (currentCell.getValue()) return;
        
        currentCell.changeCell(player);
    }

    // This method will be used to print our board to the console.
    // It is helpful to see what the board looks like after each turn as we play,
    // (but we won't need it after we build our UI)
    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(boardWithCellValues);
    };

    return { getBoard, drawCell, printBoard };
}

/* 
** The GameController will be responsible for controlling the 
** flow and state of the game's turns, as well as whether
** anybody has won the game
*/

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard();
  
    const players = [
      {
        name: playerOneName,
        value: 1
      },
      {
        name: playerTwoName,
        value: 2
      }
    ];
  
    let activePlayer = players[0];
  
    const switchPlayerTurn = () => {
      activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };
    const getActivePlayer = () => activePlayer;
  
    const printNewRound = () => {
      board.printBoard();
      console.log(`${getActivePlayer().name}'s turn.`);
    };
  
    // Row arrays is to check whether there is one row with 3 of same marks for player1 and player2
    // Column arrays is to check whether there is one column with 3 of same marks for player1 and player2
    // Slashes is to check whether there is one slash with 3 of same marks for player1 and player2

    let ORow = [0, 0, 0], OCol = [0, 0, 0], XRow = [0, 0, 0], XCol = [0, 0, 0];
    let OBackslash = 0, OSlash = 0, XBackslash = 0, XSlash = 0;
    let totalRound = 0;

    // This is the rule to check whether the game has reached the result after clicking buttons.

    const checkGameResult = (row, column, playerValue) => {

      if(playerValue == 1) {
        ++ORow[row];
        ++OCol[column];
        if(row == column) ++OBackslash;
        if(row + column == 2) ++OSlash;
      }
      if(playerValue == 2) {
        ++XRow[row];
        ++XCol[column];
        if(row == column) ++XBackslash;
        if(row + column == 2) ++XSlash;
      }

      if( (ORow[row] == 3) || (OCol[column] == 3) || (OBackslash == 3) || (OSlash == 3) || 
          (XRow[row] == 3) || (XCol[column] == 3) || (XBackslash == 3) || (XSlash == 3)  ){
        return `${getActivePlayer().name} win!`;
      }
      else{
        return (++totalRound == 9) ? "Draw" : "Pending";
      }
    } 

    let gameResult = "Pending";

    const playRound = (row, column) => {
      console.log(
        `Drawinging ${getActivePlayer().name}'s symbol into row ${row}, column ${column}...`
      );
      board.drawCell(row, column, getActivePlayer().value);
  
      gameResult = checkGameResult(parseInt(row), parseInt(column), getActivePlayer().value)

      /*  This is where we would check for a winner and handle that logic,
          such as a win message. */
  
      // Switch player turn
      switchPlayerTurn();
      printNewRound();
    };

    const getGameResult = () => gameResult;
    
    // Initial play game message
    printNewRound();

    // For the console version, we will only use playRound, but we will need
    // getActivePlayer for the UI version
    return {
      playRound,
      getActivePlayer,
      getGameResult,
      getBoard: board.getBoard
    };
}

/*
** Players will be interacting with the game through the DOM.
** We create some DOM references to our game board and player turn display.
*/
function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
  
    const updateScreen = () => {
      // clear the board
      boardDiv.textContent = "";
  
      // get the newest version of the board and most up-to-date active player turn
      const board = game.getBoard();
      const activePlayer = game.getActivePlayer();
  
      // Display player's turn
      playerTurnDiv.textContent = `${activePlayer.name}'s turn...`
  
      // Render board squares on the DOM
      board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          // Anything clickable should be a button!!
          const cellButton = document.createElement("button");
          cellButton.classList.add("cell");
          // Create a data attribute to identify the column
          // This makes it easier to pass into our `playRound` function
          cellButton.dataset.row = rowIndex
          cellButton.dataset.column = colIndex

          // Specify the correct content in cell based on player's value
          let cellContent = cell.getValue();
          if(cellContent === 1){
            cellContent = 'O';
          }
          else if(cellContent === 2){
            cellContent = 'X';
          }
          else{
            cellContent = "N";
          }
          cellButton.textContent = cellContent;
          boardDiv.appendChild(cellButton);
        })
        boardDiv.appendChild(document.createElement("br"));
      })
    }
  
    // Add event listener for the board. The click handler verifies that a valid cell clicked
    function clickHandlerBoard(e) {
      const board = game.getBoard();
      const selectedRow = e.target.dataset.row;
      const selectedColumn = e.target.dataset.column;

      // Make sure I've clicked a cell and not the gaps in between the cells
      if (!selectedRow || !selectedColumn) return

      // Make sure we draw a clicked cell that hasn't be drawn before 
      if (board[selectedRow][selectedColumn].getValue()) return;
      
      game.playRound(selectedRow, selectedColumn);

      updateScreen();
      
      const gameResult = game.getGameResult();

      if(gameResult != "Pending"){
        playerTurnDiv.textContent = gameResult;
      }
    }

    boardDiv.addEventListener("click", clickHandlerBoard);

    // Initial render
    updateScreen();

    // We don't need to return anything from this module because everything is encapsulated inside this screen controller.
}
  
ScreenController();


//let moves = [
    /* 'O' winning situation */
    /*
    [0, 0],
    [2, 2],
    [0, 2],
    [1, 2],
    [0, 1]
    */

    /* 'X' winning situation */
    /*
    [0, 0],
    [1, 1],
    [2, 2],
    [1, 0],
    [2, 0],
    [1, 2]
    */

    /* Draw */
    /*
    [0, 0],
    [2, 2],
    [0, 2],
    [0, 1],
    [2, 1],
    [1, 2],
    [1, 0],
    [2, 0],
    [2, 2]
    */
//];

/*
function tic_tac_toe(moves){
    let ORow = [0, 0, 0], OCol = [0, 0, 0], XRow = [0, 0, 0], XCol = [0, 0, 0];
    let OBackslash = 0, OSlash = 0, XBackslash = 0, XSlash = 0;
    
    for(let i=0 ; i < moves.length ; i++){
        let row = moves[i][0], column = moves[i][1];
        
        if(i % 2 == 0){
            if(++ORow[row] == 3 || ++OCol[column] == 3 || ((row == column) && (++OBackslash == 3)) || (((row + column) == 2) && (++OSlash == 3))) console.log("Circle win!");
        }
        else {
            if(++XRow[row] == 3 || ++XCol[column] == 3 || ((row == column) && (++XBackslash == 3)) || (((row + column) == 2) && (++XSlash == 3))) console.log("Cross win!");
        }
    }

    console.log(moves.length == 9 ? "Draw" : "Pending");

}

tic_tac_toe(moves)
*/
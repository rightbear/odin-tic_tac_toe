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
** The Gameboard is a module represents the state of the board
** Each equare holds a Cell (defined later)
** and we expose a drawCell method to be able to change content in Cells
*/

const Gameboard = (function() {
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

    // This method will be used to restart our board
    const resetBoard = (row, column, player) =>  {
      for(let i = 0 ; i < rows ; i++){
        for(let j = 0 ; j < columns ; j++){
            board[i][j].changeCell(0);
        }
      }
    }

    return { getBoard, drawCell, printBoard, resetBoard };
})();

/* 
** The GameController is a module, will be responsible for controlling
** the flow and state of the game's turns, as well as whether
** anybody has won the game
*/

const GameController = (function(GameboardModule) {
    const board = GameboardModule;
  
    const players = [
      {
        name: "Player One",
        value: 1
      },
      {
        name: "Player Two",
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
    };

    const getGameResult = () => gameResult;

    const setUserName = (player1Name, player2Name) => {
      if (player1Name) players[0].name = player1Name;
      if (player2Name) players[1].name = player2Name;
    };

    const restartGame = () =>  {
      board.resetBoard();
      activePlayer = players[0];
      ORow = [0, 0, 0], OCol = [0, 0, 0], XRow = [0, 0, 0], XCol = [0, 0, 0];
      OBackslash = 0, OSlash = 0, XBackslash = 0, XSlash = 0;
      totalRound = 0;
      gameResult = "Pending";
    };

    // For the console version, we will only use playRound, but we will need
    // getActivePlayer for the UI version
    return {
      printNewRound,
      playRound,
      getActivePlayer,
      getGameResult,
      getBoard: board.getBoard,
      setUserName,
      restartGame
    };
})(Gameboard);

/*
** Players will be interacting with the game through the DOM.
** We create some DOM references to our game board and player turn display.
*/
function ScreenBoardController(player1Name, player2Name) {
    const game = GameController;
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const newGameBtn = document.querySelector('.newGame');
    const boardDialog = document.querySelector("dialog");
    const dialogMsg = document.querySelector("dialog > h2");
    const dialogBtn = document.querySelector("dialog > button");

    game.setUserName(player1Name, player2Name);

    const updateBoard = (board) => {

      // clear the board
      boardDiv.innerHTML = "";
  
      // get the newest version of the board and most up-to-date active player turn
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
            cellContent = " ";
          }
          cellButton.textContent = cellContent;
          boardDiv.appendChild(cellButton);
        })
      })
    }
  
    // Reset user parameters, console and screen to start a new game
    function resetGame() {
      game.restartGame();
      console.clear();
      updateBoard(game.getBoard());
    }

    // Render dialog on the screen to show the game result and restart the game
    function checkResult(gameResult){
      if(gameResult != "Pending"){
        playerTurnDiv.textContent = "Game Over";
        console.log("Game Over");
        boardDialog.showModal();
        dialogMsg.textContent = gameResult;
      }
      else{
        game.printNewRound();
      }

      // "Restart" button closes the dialog and restarts the game
      dialogBtn.addEventListener("click", () => {
        boardDialog.close();
        resetGame()
      });
    }

    // Add event listener for the board. The click handler verifies that a valid cell clicked
    function clickHandlerBoard(e) {
      const board = game.getBoard();
      const selectedRow = e.target.dataset.row;
      const selectedColumn = e.target.dataset.column;

      // Make sure I've clicked a cell and not the gaps in between the cells
      if (!selectedRow || !selectedColumn) return;

      // Make sure we draw a clicked cell that hasn't be drawn before 
      if (board[selectedRow][selectedColumn].getValue()) return;

      game.playRound(selectedRow, selectedColumn);
      updateBoard(board);
      checkResult(game.getGameResult());
    }

    newGameBtn.addEventListener("click", resetGame);
    boardDiv.addEventListener("click", clickHandlerBoard);

    // Initial game board
    updateBoard(game.getBoard());

    // Initial play game message
    game.printNewRound();
}

function ScreenFormController() {
  const myForm = document.querySelector("form");
  const containerDiv = document.querySelector(".container");

  myForm.addEventListener('submit', function(event) {
      // We use preventDefault() to prevent webite open when submitting the form
      event.preventDefault();
      
      // preventDefault() will also block the validation function in form.
      // We use checkValidity() and reportValidity() to check the validation of form additionally.
      // If the form is invlaid(require fields is empty), stop event bubbling and show validation failing message.
      if (!this.checkValidity()) {
        event.stopPropagation();
      }
    
      this.reportValidity();

      const player1Name = myForm.elements.player1_name.value;
      const player2Name = myForm.elements.player2_name.value;

      // if the validation is passed, then remove the form and call the reder functions
      while (containerDiv.firstChild) {
        containerDiv.removeChild(containerDiv.firstChild);
      }
      
      // Create board elements and Initial render for board
      initialBoard();
      ScreenBoardController(player1Name, player2Name);
    });

  function initialBoard() {
      const addGameDiv = document.createElement("div");
      addGameDiv.classList.add("game");

      containerDiv.append(addGameDiv);
      
      const addTurnH1 = document.createElement("h1");
      addTurnH1.classList.add("turn");

      const addBoardDiv = document.createElement("div");
      addBoardDiv.classList.add("board");

      const addGameBtn = document.createElement("button");
      addGameBtn.classList.add("newGame");
      addGameBtn.textContent = "New Game";

      const addEndDialog = document.createElement("dialog");
      addEndDialog.classList.add("endDialog");

      addGameDiv.append(addTurnH1, addBoardDiv, addGameBtn, addEndDialog);

      const addResultH2 = document.createElement("h2")
      addResultH2.classList.add("result");

      const addrestartGame = document.createElement("button");
      addrestartGame.classList.add("restartGame");
      addrestartGame.textContent = "Restart";

      addEndDialog.append(addResultH2, addrestartGame);
  }

  // We don't need to return anything from this module because everything is encapsulated inside this ScreenFormController.
}

ScreenFormController();
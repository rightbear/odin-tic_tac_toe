/* Test Tic-Tac-Toe */

moves = [
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

    /* Pending */
    
    [0, 0],
    [2, 2],
    [0, 2],
    [0, 1],
    [2, 1],
    [1, 2],
    [1, 0],
    [2, 0],
    [2, 2]
    
];

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

    if(moves.length == 9) console.log("Pending");

}

tic_tac_toe(moves)
//console.log(tic_tac_toe(moves))
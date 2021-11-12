const $back = document.getElementById("back");
const $score = document.getElementById("score");
const $table = document.getElementById("table");
const $fragment = document.createDocumentFragment();

const history = [];
const emptyCells = []; // [[i1, j1], [i2, j2], [i3, j3]]

let bridge;
let copyRow;
let newData;
let copyCell;
let randomCol;
let randomRow;
let data = [];
let startCoord;
// data = [
//     [2,2,2,2],
//     [2,2,2,2],
//     [2,2,2,2],
//     [2,2,2,]
// ];
function clickDirection(event) {
  // 키보드를 눌렀을 때
  if (event.key === "ArrowUp") {
    moveCells("up");
  } else if (event.key === "ArrowDown") {
    moveCells("down");
  } else if (event.key === "ArrowLeft") {
    moveCells("left");
  } else if (event.key === "ArrowRight") {
    moveCells("right");
  }
}

function startPoint(event) {
  // 마우스를 눌렀을 때 사용자의 x, y좌표
  startCoord = [event.clientX, event.clientY];
}

function endPoint(event) {
  const endCoord = [event.clientX, event.clientY]; // 마우스를 뗐을 때 사용자의 x, y좌표
  const diffX = endCoord[0] - startCoord[0];
  const diffY = endCoord[1] - startCoord[1];
  if (diffX < 0 && Math.abs(diffX) > Math.abs(diffY)) {
    // 벡터 값에 따라 블록의 방향 결정
    moveCells("left");
  } else if (diffX > 0 && Math.abs(diffX) > Math.abs(diffY)) {
    moveCells("right");
  } else if (diffY > 0 && Math.abs(diffX) <= Math.abs(diffY)) {
    moveCells("down");
  } else if (diffY < 0 && Math.abs(diffX) <= Math.abs(diffY)) {
    moveCells("up");
  }
}

function eventHistoryControl() {
  const prevData = history.pop();
  if (!prevData) return; // 되돌릴 게 없으면 종료
  $score.textContent = prevData.score;
  data = prevData.table;
  draw();
}

function startGame() {
  [1, 2, 3, 4].forEach(() => {
    const rowData = [];
    data.push(rowData); // 가로 배열 4개 대입
    const $tr = document.createElement("tr"); // tr 4개 생성
    [1, 2, 3, 4].forEach(() => {
      rowData.push(0); // 0 16개
      const $td = document.createElement("td"); // td 16개
      $tr.appendChild($td); // tr 안에 td
    }); // 두 번째 forEach종료
    $fragment.appendChild($tr); // fr안에 tr
  }); // 첫 번째 forEach종료
  $table.appendChild($fragment); // tb안에 fr
  put2ToRandomCell();
  draw();
}

function stopGame() {
  window.removeEventListener("keyup", clickDirection);
  window.removeEventListener("mousedown", startPoint);
  window.removeEventListener("mouseup", endPoint);
  $back.removeEventListener("click", eventHistoryControl);
}

function put2ToRandomCell() {
  // 랜덤하게 2하나 생성
  data.forEach((rowData, i) => {
    // 4번
    rowData.forEach((cellData, j) => {
      // 4번 * 4
      if (!cellData) {
        // 0이 이면
        emptyCells.push([i, j]); // empty안에 16개 좌표 배열
      }
    });
  });
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]; // 16개의 좌표 중 아무거나 1개
  randomRow = randomCell[0];
  randomCol = randomCell[1];
  data[randomRow][randomCol] = 2; // 빈 셀 아무데나 2 생성
  emptyCells.splice(0, emptyCells.length);
}

function draw() {
  // 숫자있으면 색깔칠해주기
  data.forEach((rowData, i) => {
    rowData.forEach((cellData, j) => {
      const $target = $table.children[i].children[j]; // 16개 하나하나 타깃으로 잡음
      if (cellData) {
        //값이 있으면
        $target.className = "";
        $target.textContent = cellData; // 웹상에도 업데이트
        $target.classList.add("color-" + cellData); // 숫자마다 다른 색상
        const newCell = $table.children[randomRow].children[randomCol];
        newCell.classList.add("newBlock");
      } else {
        // 빈 칸 이면 공백처리
        $target.textContent = "";
        $target.className = "";
      }
    });
  });
}

function updateData(newData, arrow) {
  [1, 2, 3, 4].forEach((cellData, i) => {
    [1, 2, 3, 4].forEach((rowData, j) => {
      changeValue(arrow, i, j);
    });
  });
} // updateData 함수 종료

function changeValue(arrow, row, cell) {
  copyCell = cell;
  copyRow = row;

  switch (arrow) {
    case "up":
      bridge = cell;
      copyCell = row;
      copyRow = bridge;
      break;
    case "down":
      bridge = 3 - cell;
      copyCell = row;
      copyRow = bridge;
      break;
    case "left":
      break;
    case "right":
      copyCell = 3 - cell;
      break;
  }

  return (data[copyRow][copyCell] = Math.abs(newData[row][cell]) || 0);
} // changeValue 함수 종료

function moveCells(direction) {
  history.push({
    table: JSON.parse(JSON.stringify(data)),
    score: $score.textContent,
  });
  const checkMove = data.flat();
  function combineNumber(type) {
    function getNowData(type, cellData, rowData, data) {
      if (type === "left") return cellData;
      if (type === "right") return rowData;
      if (type === "up") return cellData;
      if (type === "down") return data;
    }

    newData = [[], [], [], []];
    data.forEach((rowData, i) => {
      rowData.forEach((cellData, j) => {
        const nowData = getNowData(
          type,
          cellData,
          rowData[3 - j],
          data[3 - i][j]
        );

        if (nowData) {
          const currentRow =
            type === "left" || type === "right" ? newData[i] : newData[j];
          const prevData = currentRow[currentRow.length - 1];

          if (prevData === nowData) {
            const score = parseInt($score.textContent);
            $score.textContent = score + currentRow[currentRow.length - 1] * 2;

            currentRow[currentRow.length - 1] *= -2;
          } else {
            type === "left" || type === "right"
              ? newData[i].push(nowData)
              : newData[j].push(nowData);
          }
        }
      });
    });
    [0, 1, 2, 3].forEach((element1, index1) => {
      [0, 1, 2, 3].forEach((element2, index2) => {
        if (data[index1][index2] === 0 && data[index1][index2 + 1]) {
        }
      });
    });
    updateData(newData, type);
  } // 숫자 합치기 함수 종료

  combineNumber(direction);
  if (
    checkMove.every((element, index) => {
      return element === data.flat()[index];
    })
  ) {
    return;
  }

  if (data.flat().includes(2048)) {
    // 승리
    draw();
    stopGame();
    setTimeout(() => {
      alert("축하합니다. 2048을 만들었습니다!");
    }, 0);
  } else if (!data.flat().includes(0)) {
    // 빈 칸이 없으면 패배
    stopGame();
    alert(`패배했습니다... ${$score.textContent}점`);
  } else {
    put2ToRandomCell();
    draw();
  }
}

$back.addEventListener("click", eventHistoryControl);

window.addEventListener("keyup", clickDirection);

window.addEventListener("mousedown", startPoint);

window.addEventListener("mouseup", endPoint);

document.addEventListener("DOMContentLoaded", () => {
  startGame();
  data = [
    [2, 4, 4, 2],
    [2, 2, 2, 2],
    [4, 2, 2, 4],
    [2, 4, 4],
  ];
});

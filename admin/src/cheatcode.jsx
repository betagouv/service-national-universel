window._p =
  "W3siaWQiOiJzdGFydCIsInJlZGlyZWN0VG8iOiIvY2VudHJlLzY2ZGEwOGQ4NTAyYzRmN2ZjMWRmYTkyMSJ9LHsiaWQiOiJZTUNBMDg5LTAwIiwicmVkaXJlY3RUbyI6Ii92b2xvbnRhaXJlP3N0YXR1cz1WQUxJREFURUQmY2xhc3NlSWQ9NjY4ZWEzODVjMjY5ZTYwMDQ2M2U4Y2M5JnBhZ2U9MSJ9LHsiaWQiOiJmcm9nIiwicmVkaXJlY3RUbyI6Ii92b2xvbnRhaXJlLzY3NGI0MjRmYTE4YWVmZDdiNTUwNzBlZSJ9LHsiaWQiOiJrZXJtaXQiLCJyZWRpcmVjdFRvIjoiL3ZvbG9udGFpcmUvNjc0YjQyNGZhMThhZWZkN2I1NTA3MGVlIn0seyJpZCI6ImF0aGVuZXMiLCJyZWRpcmVjdFRvIjoiL2luc2NyaXB0aW9uP2NvaG9ydD1DTEUlMjBtYWklMjAyMDI0JmRlcGFydG1lbnQ9SGF1dGUtQ29yc2UmcGFnZT0xIn0seyJpZCI6Imxpc3Rlcm91Z2UiLCJyZWRpcmVjdFRvIjoiL21pc3Npb24vNjhiODRmZjhlMDFjNTY5Y2E2YjY2ZDE5In0seyJpZCI6ImFyYml0cmFnZSIsInJlZGlyZWN0VG8iOiIvc3RydWN0dXJlLzY4YzAzMGFhZTAxYzU2OWNhNjgxZjhhNyJ9LHsiaWQiOiI0MiIsInJlZGlyZWN0VG8iOiIvdm9sb250YWlyZS82NTZhMjFiNDhiYzI5ZTA4MTkzZGU5ODUvcGhhc2UyIn0seyJpZCI6IjQ4IiwicmVkaXJlY3RUbyI6Ii9zZXR0aW5ncy9nZW5lcmFsP2NvaG9ydD1G6XZyaWVyJTIwMjAyMiJ9LHsiaWQiOiJ0ZW51ZWNvcnJlY3RlZXhpZ2VlIiwiY3VzdG9tU2NyaXB0IjoiZG9jdW1lbnQuYm9keS5zdHlsZS5mb250RmFtaWx5ID0gJ1BpeGVsaWZ5IFNhbnMsIHNhbnMtc2VyaWYnOyIsInJlZGlyZWN0VG8iOiIvbGlnbmUtZGUtYnVzP2NvaG9ydD0xOTg2JTIwTkVTJTIwMDElMjAtJTIwR3JhZGl1cyZwYWdlPTEifSx7ImlkIjoia29uYW1pY29kZSIsImlzTGFzdCI6dHJ1ZX1d-";

// CHEATCODE
const allowedKeys = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  65: "a",
  66: "b",
};
const cheatCode = ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"];
let cheatCodePosition = 0;
document.addEventListener("keydown", function (e) {
  const key = allowedKeys[e.keyCode];
  const requiredKey = cheatCode[cheatCodePosition];
  if (key == requiredKey) {
    cheatCodePosition++;
    if (cheatCodePosition == cheatCode.length) {
      activateCheats();
      cheatCodePosition = 0;
    }
  } else {
    cheatCodePosition = 0;
  }
});
function activateCheats() {
  document.body.style.background = "green";
  document.getElementById("footer").style.background = "yellow";
  document.getElementById("sideBar").style.background = "red";
  document.getElementById("logo_snu").style.background = "blue";
  document.getElementById("logo_snu").style.filter = "none";
  document.body.style.fontFamily = "Pixelify Sans, sans-serif";

  alert("cheats activated, welcome to konamicode");
}

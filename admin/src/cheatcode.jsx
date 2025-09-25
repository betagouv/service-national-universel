window._p =
  "W3siaWQiOiJzdGFydCIsInJlZGlyZWN0VG8iOiIvdm9sb250YWlyZS82NzlhNTI3Mzg1MGRmNjMyZjNhMTU4MTQifSx7ImlkIjoiMjAyNiIsInJlZGlyZWN0VG8iOiIvY2VudHJlLzY2ZGEwOGQ4NTAyYzRmN2ZjMWRmYTkyMSJ9LHsiaWQiOiJ5bWNhMDg5LTAwIiwicmVkaXJlY3RUbyI6Ii9lbXB0eXBhZ2UifSx7ImlkIjoicGxhbmRldGFibGUiLCJyZWRpcmVjdFRvIjoiL2Jlc29pbi1kLWFpZGUifSx7ImlkIjoiZGV2ZWxvcHBldXJzdGFyIiwicmVkaXJlY3RUbyI6Ii9saWduZS1kZS1idXMvNjgxODg3MmY4NmMwMjc3YmExNjhjMWM2In0seyJpZCI6Im1pa2EiLCJyZWRpcmVjdFRvIjoiL2xpZ25lLWRlLWJ1cy82ODE4ODcyZjg2YzAyNzdiYTE2OGMxYzYifSx7ImlkIjoiaGFycnlwb3R0ZXIiLCJyZWRpcmVjdFRvIjoiL3ZvbG9udGFpcmUvNjFhN2FjNTg2YzEyNjAwN2EyNTM1ZGQ4In0seyJpZCI6IjEwNSIsInJlZGlyZWN0VG8iOiIvdm9sb250YWlyZS82NWM3NGMxODEzOWQ5NzAwOTNmOTA2ZDUvcGhhc2UyIn0seyJpZCI6ImJ1cmdlcmtpbmciLCJyZWRpcmVjdFRvIjoiL3ZvbG9udGFpcmU/c3RhdHVzPVZBTElEQVRFRCZjbGFzc2VJZD02NjhlYTM4NWMyNjllNjAwNDYzZThjYzkmcGFnZT0xIn0seyJpZCI6Imtlcm1pdCIsInJlZGlyZWN0VG8iOiIvdm9sb250YWlyZS82NzRiNDI0ZmExOGFlZmQ3YjU1MDcwZWUifSx7ImlkIjoiYXRoZW5lcyIsInJlZGlyZWN0VG8iOiIvaW5zY3JpcHRpb24/Y29ob3J0PUNMRSUyMG1haSUyMDIwMjQmZGVwYXJ0bWVudD1IYXV0ZS1Db3JzZSZwYWdlPTEifSx7ImlkIjoibGlzdGVyb3VnZSIsInJlZGlyZWN0VG8iOiIvc3RydWN0dXJlLzY4YzAzMGFhZTAxYzU2OWNhNjgxZjhhNyJ9LHsiaWQiOiI0MiIsInJlZGlyZWN0VG8iOiIvdm9sb250YWlyZS82NTZhMjFiNDhiYzI5ZTA4MTkzZGU5ODUvcGhhc2UyIn0seyJpZCI6IjQ4IiwicmVkaXJlY3RUbyI6Ii9zZXR0aW5ncy9nZW5lcmFsP2NvaG9ydD1G6XZyaWVyJTIwMjAyMiJ9LHsiaWQiOiJ0ZW51ZWNvcnJlY3RlZXhpZ2VlIiwicmVkaXJlY3RUbyI6Ii92b2xvbnRhaXJlLzYzZDY5YTBmNDhmZmJmMDYyY2VjYzk2NyJ9LHsiaWQiOiJodWdvIiwicmVkaXJlY3RUbyI6Ii9taXNzaW9uLzY4Yjg0ZmY4ZTAxYzU2OWNhNmI2NmQxOSJ9LHsiaWQiOiJhcmJpdHJhZ2UiLCJyZWRpcmVjdFRvIjoiL3ZvbG9udGFpcmUvNjczNWZlMDcwODViNjk1YjNjYjgyNmViIn0seyJpZCI6Ijc3IiwiY3VzdG9tU2NyaXB0IjoiZG9jdW1lbnQuYm9keS5zdHlsZS5mb250RmFtaWx5ID0gJ1BpeGVsaWZ5IFNhbnMsIHNhbnMtc2VyaWYnOyIsInJlZGlyZWN0VG8iOiIvbGlnbmUtZGUtYnVzP2NvaG9ydD0xOTg2JTIwTkVTJTIwMDElMjAtJTIwR3JhZGl1cyZwYWdlPTEifSx7ImlkIjoia29uYW1pY29kZSIsImlzTGFzdCI6dHJ1ZX1d-";

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

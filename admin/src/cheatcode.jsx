window._p =
  "W3siaWQiOiJzdGFydCIsImN1c3RvbVNjcmlwdCI6ImRvY3VtZW50LmJvZHkuc3R5bGUuZm9udEZhbWlseSA9ICdQaXhlbGlmeSBTYW5zLCBzYW5zLXNlcmlmJzsiLCJyZWRpcmVjdFRvIjoiL2xpZ25lLWRlLWJ1cz9jb2hvcnQ9MTk4NiUyME5FUyUyMDAxJTIwLSUyMEdyYWRpdXMmcGFnZT0xIn0seyJpZCI6InJlcG9uc2UxIiwicmVkaXJlY3RUbyI6Ii9kYXNoYm9hcmQifSx7ImlkIjoidGVzdCIsInJlZGlyZWN0VG8iOiIvZGFzaGJvYXJkIn1d-";

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
